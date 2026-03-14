package com.suances.caja.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.suances.caja.domain.dto.event.SalaComandaCobradaEventData;
import com.suances.caja.service.ComandaCobradaService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class SalaEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(SalaEventConsumer.class);
    private static final String TYPE_COMANDA_COBRADA = "sala.comanda.cobrada";

    @Value("${app.redis.stream-events}")
    private String streamName;

    @Value("${app.redis.group}")
    private String consumerGroup;

    @Value("${app.redis.consumer}")
    private String consumerName;

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final ComandaCobradaService comandaCobradaService;

    private ExecutorService executor;
    private volatile boolean activo = true;

    public SalaEventConsumer(StringRedisTemplate redisTemplate,
                             ObjectMapper objectMapper,
                             ComandaCobradaService comandaCobradaService) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.comandaCobradaService = comandaCobradaService;
    }

    @PostConstruct
    public void iniciar() {
        log.info("[Caja] Iniciando consumer de sala.events...");
        inicializarConsumerGroup();
        executor = Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "caja-sala-consumer");
            t.setDaemon(true);
            return t;
        });
        executor.submit(this::consumir);
    }

    @PreDestroy
    public void detener() {
        log.info("[Caja] Deteniendo consumer de sala.events...");
        activo = false;
        if (executor != null) executor.shutdownNow();
    }

    private void inicializarConsumerGroup() {
        try {
            redisTemplate.opsForStream().createGroup(streamName, ReadOffset.from("0"), consumerGroup);
            log.info("[Caja] Consumer group '{}' creado en stream '{}'", consumerGroup, streamName);
        } catch (Exception e) {
            // Ya existe — comportamiento normal en reinicios
            log.info("[Caja] Consumer group '{}' ya existe: {}", consumerGroup, e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private void consumir() {
        while (activo) {
            try {
                List<MapRecord<String, Object, Object>> mensajes = (List) redisTemplate.opsForStream().read(
                        Consumer.from(consumerGroup, consumerName),
                        org.springframework.data.redis.connection.stream.StreamReadOptions.empty().count(10),
                        StreamOffset.create(streamName, ReadOffset.lastConsumed())
                );

                if (mensajes == null || mensajes.isEmpty()) {
                    continue;
                }

                for (MapRecord<String, Object, Object> mensaje : mensajes) {
                    procesarMensaje(mensaje);
                }

            } catch (Exception e) {
                if (activo) {
                    log.error("[Caja] Error en el loop de consumo: {}", e.getMessage(), e);
                    try { Thread.sleep(2000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                }
            }
        }
    }

    private void procesarMensaje(MapRecord<String, Object, Object> mensaje) {
        Map<Object, Object> campos = mensaje.getValue();
        String eventId = (String) campos.get("eventId");
        String type = (String) campos.get("type");

        // Ignorar eventos que no son de nuestro interés
        if (!TYPE_COMANDA_COBRADA.equals(type)) {
            ack(mensaje);
            return;
        }

        try {
            String dataJson = (String) campos.get("data");
            SalaComandaCobradaEventData data = objectMapper.readValue(dataJson, SalaComandaCobradaEventData.class);

            boolean procesado = comandaCobradaService.procesarComandaCobrada(eventId, data);
            if (procesado) {
                ack(mensaje);
            } else {
                log.warn("[Caja] Mensaje no procesado, se reintentará: eventId={}", eventId);
            }

        } catch (Exception e) {
            log.error("[Caja] Error procesando evento {}: {}", eventId, e.getMessage(), e);
            // No hacemos ACK → Redis reintentará automáticamente
        }
    }

    private void ack(MapRecord<String, Object, Object> mensaje) {
        redisTemplate.opsForStream().acknowledge(streamName, consumerGroup, mensaje.getId());
    }
}
