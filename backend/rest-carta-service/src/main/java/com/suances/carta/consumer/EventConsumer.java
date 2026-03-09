package com.suances.carta.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.suances.carta.domain.model.Escandallo;
import com.suances.carta.domain.model.EscandalloDetalle;
import com.suances.carta.domain.model.EventosProcesados;
import com.suances.carta.domain.model.Ingrediente;
import com.suances.carta.dto.event.SalaPedidoEvent;
import com.suances.carta.dto.event.StockBajoEvent;
import com.suances.carta.repository.EscandalloRepository;
import com.suances.carta.repository.EventosProcesadosRepository;
import com.suances.carta.service.EventProducer;
import com.suances.carta.service.IngredienteService;
import com.suances.carta.service.PlatoService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class EventConsumer {

    private static final Logger log = LoggerFactory.getLogger(EventConsumer.class);

    @Value("${app.redis.stream-events}")
    private String streamEvents;

    @Value("${app.redis.stream-output}")
    private String streamOutput;

    @Value("${app.redis.group}")
    private String group;

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final EventosProcesadosRepository eventosProcesadosRepository;
    private final PlatoService platoService;
    private final IngredienteService ingredienteService;
    private final EventProducer eventProducer;
    private final EscandalloRepository escandalloRepository;

    private ExecutorService executor;
    private volatile boolean activo = true;

    public EventConsumer(StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper,
            EventosProcesadosRepository eventosProcesadosRepository,
            PlatoService platoService,
            IngredienteService ingredienteService,
            EventProducer eventProducer,
            EscandalloRepository escandalloRepository) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.eventosProcesadosRepository = eventosProcesadosRepository;
        this.platoService = platoService;
        this.ingredienteService = ingredienteService;
        this.eventProducer = eventProducer;
        this.escandalloRepository = escandalloRepository;
    }

    @PostConstruct
    public void iniciarConsumidor() {
        log.info("Iniciando consumidor de eventos Redis...");
        inicializarConsumerGroup();

        executor = Executors.newSingleThreadExecutor();
        executor.submit(this::consumirEventos);
    }

    @PreDestroy
    public void detenerConsumidor() {
        log.info("Deteniendo consumidor de eventos Redis...");
        activo = false;
        if (executor != null && !executor.isShutdown()) {
            executor.shutdownNow();
        }
    }

    private void inicializarConsumerGroup() {
        try {
            redisTemplate.opsForStream().createGroup(streamEvents, ReadOffset.from("0"), group);
            log.info("Consumer group '{}' creado exitosamente", group);
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("BUSYGROUP")) {
                log.info("Consumer group '{}' ya existe", group);
            } else {
                log.warn("No se pudo crear consumer group (stream puede no existir): {}", e.getMessage());
            }
        }
    }

    private void consumirEventos() {
        log.info("Iniciando bucle de consumo de eventos...");

        while (activo && !Thread.currentThread().isInterrupted()) {
            try {
                List<MapRecord<String, Object, Object>> registros = redisTemplate.opsForStream().read(
                        Consumer.from(group, "carta-consumer"),
                        StreamReadOptions.empty().count(1).block(Duration.ofSeconds(5)),
                        StreamOffset.create(streamEvents, ReadOffset.lastConsumed()));

                if (registros != null && !registros.isEmpty()) {
                    for (MapRecord<String, Object, Object> registro : registros) {
                        procesarEvento(registro);
                    }
                }
            } catch (Exception e) {
                if (!activo) {
                    break;
                }
                log.error("Error en consumidor de eventos", e);
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }

    private void procesarEvento(MapRecord<String, Object, Object> registro) {
        String eventId = registro.getId().toString();
        Map<Object, Object> datos = registro.getValue();

        try {
            String json = (String) datos.get("data");
            SalaPedidoEvent evento = objectMapper.readValue(json, SalaPedidoEvent.class);

            log.info("Procesando evento: type={}, eventId={}, platoId={}, cantidad={}",
                    evento.getType(), evento.getEventId(), evento.getPlatoId(), evento.getCantidad());

            // Solo procesar eventos de items enviados a cocina (no cuando se crean)
            if (!"sala.item.enviado_cocina".equals(evento.getType())) {
                log.info("Evento no es de tipo 'enviado_cocina', ignorando: {}", evento.getType());
                redisTemplate.opsForStream().acknowledge(streamEvents, group, eventId);
                return;
            }

            if (eventosProcesadosRepository.existsByEventId(evento.getEventId())) {
                log.info("Evento ya procesado, ignorando: {}", evento.getEventId());
                redisTemplate.opsForStream().acknowledge(streamEvents, group, eventId);
                return;
            }

            platoService.incrementarContador(evento.getPlatoId(), evento.getCantidad());

            ingredienteService.descontarStock(evento.getPlatoId(), evento.getCantidad());

            verificarYEmitirAlertasStock(evento.getPlatoId());

            EventosProcesados eventosProcesados = new EventosProcesados();
            eventosProcesados.setEventId(evento.getEventId());
            eventosProcesadosRepository.save(eventosProcesados);

            redisTemplate.opsForStream().acknowledge(streamEvents, group, eventId);

            log.info("Evento procesado exitosamente: {}", evento.getEventId());

        } catch (Exception e) {
            log.error("Error al procesar evento: {}", eventId, e);
        }
    }

    private void verificarYEmitirAlertasStock(UUID platoId) {
        try {
            Optional<Escandallo> escandallo = escandalloRepository.findByPlatoId(platoId);
            if (escandallo.isPresent() && escandallo.get().getDetalles() != null) {
                for (EscandalloDetalle detalle : escandallo.get().getDetalles()) {
                    Ingrediente ingrediente = detalle.getIngrediente();
                    if (ingredienteService.verificarCruceUmbral(ingrediente.getId())) {
                        StockBajoEvent evento = new StockBajoEvent(
                                ingrediente.getId(),
                                ingrediente.getNombre(),
                                ingrediente.getStockActual(),
                                ingrediente.getUmbralAlerta());
                        eventProducer.publicarStockBajo(evento);
                        log.info("Alerta de stock bajo emitida para ingrediente: {}", ingrediente.getNombre());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error al verificar alertas de stock", e);
        }
    }
}
