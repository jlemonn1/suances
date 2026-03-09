package com.suances.sala.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.suances.sala.domain.model.EventoProcesado;
import com.suances.sala.event.dto.IngredienteStockChangedEvent;
import com.suances.sala.event.dto.PlatoDisponibilidadChangedEvent;
import com.suances.sala.event.dto.PlatoUpdatedEvent;
import com.suances.sala.event.dto.TipoCartaUpdatedEvent;
import com.suances.sala.repository.EventoProcesadoRepository;
import com.suances.sala.service.CartaSyncService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class CartaEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(CartaEventConsumer.class);

    @Value("${app.redis.stream-carta-input}")
    private String streamInput;

    @Value("${app.redis.consumer-group}")
    private String consumerGroup;

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final EventoProcesadoRepository eventoProcesadoRepository;
    private final CartaSyncService cartaSyncService;
    private final SseEmitterManager sseEmitterManager;

    private ExecutorService executor;
    private volatile boolean activo = true;

    public CartaEventConsumer(StringRedisTemplate redisTemplate,
                             ObjectMapper objectMapper,
                             EventoProcesadoRepository eventoProcesadoRepository,
                             CartaSyncService cartaSyncService,
                             SseEmitterManager sseEmitterManager) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.eventoProcesadoRepository = eventoProcesadoRepository;
        this.cartaSyncService = cartaSyncService;
        this.sseEmitterManager = sseEmitterManager;
    }

    @PostConstruct
    public void iniciarConsumidor() {
        log.info("Iniciando consumidor de eventos de carta...");
        inicializarConsumerGroup();
        executor = Executors.newSingleThreadExecutor();
        executor.submit(this::consumirEventos);
    }

    @PreDestroy
    public void detenerConsumidor() {
        log.info("Deteniendo consumidor de eventos de carta...");
        activo = false;
        if (executor != null && !executor.isShutdown()) {
            executor.shutdownNow();
        }
    }

    private void inicializarConsumerGroup() {
        try {
            redisTemplate.opsForStream().createGroup(streamInput, ReadOffset.from("0"), consumerGroup);
            log.info("Consumer group '{}' creado exitosamente para carta", consumerGroup);
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("BUSYGROUP")) {
                log.info("Consumer group '{}' ya existe para carta", consumerGroup);
            } else {
                log.warn("No se pudo crear consumer group para carta: {}", e.getMessage());
            }
        }
    }

    private void consumirEventos() {
        while (activo && !Thread.currentThread().isInterrupted()) {
            try {
                List<MapRecord<String, Object, Object>> registros = redisTemplate.opsForStream().read(
                        Consumer.from(consumerGroup, "sala-carta-consumer"),
                        StreamReadOptions.empty().count(1).block(Duration.ofSeconds(5)),
                        StreamOffset.create(streamInput, ReadOffset.lastConsumed()));

                if (registros != null && !registros.isEmpty()) {
                    for (MapRecord<String, Object, Object> registro : registros) {
                        procesarEvento(registro);
                    }
                }
            } catch (Exception e) {
                if (!activo) break;
                log.error("Error en consumidor de eventos de carta", e);
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
        String streamEventId = registro.getId().toString();
        Map<Object, Object> datos = registro.getValue();

        try {
            String eventId = (String) datos.get("eventId");
            String tipo = (String) datos.get("type");
            String json = (String) datos.get("data");

            log.info("Procesando evento de carta: {} - ID: {}", tipo, eventId);

            // Verificar idempotencia
            if (eventId == null || eventoProcesadoRepository.existsByEventId(java.util.UUID.fromString(eventId))) {
                log.info("Evento de carta ya procesado o sin eventId, ignorando: {}", eventId);
                redisTemplate.opsForStream().acknowledge(streamInput, consumerGroup, streamEventId);
                return;
            }

            switch (tipo) {
                case "carta.plato.created":
                    PlatoUpdatedEvent platoCreated = objectMapper.readValue(json, PlatoUpdatedEvent.class);
                    procesarPlatoCreado(platoCreated);
                    break;
                case "carta.plato.updated":
                    PlatoUpdatedEvent platoUpdated = objectMapper.readValue(json, PlatoUpdatedEvent.class);
                    procesarPlatoActualizado(platoUpdated);
                    break;
                case "carta.plato.disponible":
                    PlatoDisponibilidadChangedEvent platoDisp = objectMapper.readValue(json, PlatoDisponibilidadChangedEvent.class);
                    procesarPlatoDisponibilidad(platoDisp);
                    break;
                case "carta.stock.changed":
                    IngredienteStockChangedEvent stockChanged = objectMapper.readValue(json, IngredienteStockChangedEvent.class);
                    procesarStockChanged(stockChanged);
                    break;
                case "carta.stock.bajo":
                    IngredienteStockChangedEvent stockBajo = objectMapper.readValue(json, IngredienteStockChangedEvent.class);
                    procesarStockBajo(stockBajo);
                    break;
                case "carta.tipo_carta.updated":
                    TipoCartaUpdatedEvent tipoCartaUpdated = objectMapper.readValue(json, TipoCartaUpdatedEvent.class);
                    procesarTipoCartaActualizado(tipoCartaUpdated);
                    break;
                case "carta.tipo_carta.platos_updated":
                    com.suances.sala.event.dto.TipoCartaPlatosChangedEvent tipoCartaPlatos = 
                        objectMapper.readValue(json, com.suances.sala.event.dto.TipoCartaPlatosChangedEvent.class);
                    procesarTipoCartaPlatosActualizados(tipoCartaPlatos);
                    break;
                default:
                    log.warn("Tipo de evento de carta no manejado: {}", tipo);
            }

            // Marcar como procesado
            if (eventId != null) {
                EventoProcesado eventoProcesado = new EventoProcesado();
                eventoProcesado.setEventId(java.util.UUID.fromString(eventId));
                eventoProcesado.setTipoEvento(tipo);
                eventoProcesado.setOrigen("carta-service");
                eventoProcesadoRepository.save(eventoProcesado);
            }

            // Acknowledge
            redisTemplate.opsForStream().acknowledge(streamInput, consumerGroup, streamEventId);

        } catch (Exception e) {
            log.error("Error al procesar evento de carta del stream: {}", streamEventId, e);
        }
    }

    private void procesarPlatoCreado(PlatoUpdatedEvent evento) {
        log.info("Plato creado en carta: {} - Precio: {}", evento.getNombre(), evento.getPrecioVenta());

        // Actualizar plato operativo y guardar en BD
        cartaSyncService.actualizarPlatoOperativo(
            evento.getId(),
            evento.getNombre(),
            evento.getDescripcion(),
            evento.getPrecioVenta(),
            evento.getCategoriaId(),
            evento.getCategoriaNombre(),
            evento.getActivo(),
            evento.getImagenUrl()
        );

        // Sincronizar ingredientes del plato
        cartaSyncService.sincronizarIngredientesPlato(evento.getId());

        // Calcular stock inicial
        cartaSyncService.calcularStockPlato(evento.getId());

        // NOTA: El plato NO se asocia automáticamente a tipos de carta.
        // Esto se hace manualmente mediante el endpoint de asociación.
        // El evento carta.tipo_carta.platos_updated se emitirá cuando se asocie.

        // Emitir evento SSE a clientes conectados
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("platoId", evento.getId());
        eventData.put("nombre", evento.getNombre());
        eventData.put("descripcion", evento.getDescripcion());
        eventData.put("precioVenta", evento.getPrecioVenta());
        eventData.put("categoriaId", evento.getCategoriaId());
        eventData.put("categoriaNombre", evento.getCategoriaNombre());
        eventData.put("activo", evento.getActivo());
        eventData.put("imagenUrl", evento.getImagenUrl());
        eventData.put("tipo", "PLATO_CREADO");

        sseEmitterManager.broadcast("carta.plato_creado", eventData);
        log.info("[SSE] Evento carta.plato_creado emitido para plato {}", evento.getId());
    }

    private void procesarPlatoActualizado(PlatoUpdatedEvent evento) {
        log.info("Plato actualizado en carta: {} - Precio: {}", evento.getNombre(), evento.getPrecioVenta());
        
        // Actualizar plato operativo y guardar en BD
        cartaSyncService.actualizarPlatoOperativo(
            evento.getId(),
            evento.getNombre(),
            evento.getDescripcion(),
            evento.getPrecioVenta(),
            evento.getCategoriaId(),
            evento.getCategoriaNombre(),
            evento.getActivo(),
            evento.getImagenUrl()
        );
        
        // Sincronizar ingredientes actualizados
        cartaSyncService.sincronizarIngredientesPlato(evento.getId());
        
        // Recalcular stock con los posibles cambios en ingredientes
        cartaSyncService.calcularStockPlato(evento.getId());

        // Emitir evento SSE a clientes conectados
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("platoId", evento.getId());
        eventData.put("nombre", evento.getNombre());
        eventData.put("descripcion", evento.getDescripcion());
        eventData.put("precioVenta", evento.getPrecioVenta());
        eventData.put("categoriaId", evento.getCategoriaId());
        eventData.put("categoriaNombre", evento.getCategoriaNombre());
        eventData.put("activo", evento.getActivo());
        eventData.put("imagenUrl", evento.getImagenUrl());
        eventData.put("ingredientes", evento.getIngredientes());
        eventData.put("tipo", "PLATO_ACTUALIZADO");
        
        sseEmitterManager.broadcast("carta.plato_actualizado", eventData);
        log.info("[SSE] Evento carta.plato_actualizado emitido para plato {}", evento.getId());
    }

    private void procesarPlatoDisponibilidad(PlatoDisponibilidadChangedEvent evento) {
        log.info("Disponibilidad de plato cambiada: {} - Disponible: {}", evento.getNombre(), evento.getDisponible());
        
        // Actualizar disponibilidad en BD
        cartaSyncService.actualizarDisponibilidadPlato(evento.getId(), evento.getDisponible());

        // Emitir evento SSE
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("platoId", evento.getId());
        eventData.put("nombre", evento.getNombre());
        eventData.put("disponible", evento.getDisponible());
        
        String eventType = Boolean.TRUE.equals(evento.getDisponible()) ? "carta.plato_disponible" : "carta.plato_no_disponible";
        sseEmitterManager.broadcast(eventType, eventData);
        log.info("[SSE] Evento {} emitido para plato {}", eventType, evento.getId());
    }

    private void procesarStockChanged(IngredienteStockChangedEvent evento) {
        log.info("Stock de ingrediente cambiado: {} - Stock: {}", evento.getNombre(), evento.getStockActual());
        
        // Actualizar ingrediente y recalcular stock de platos
        cartaSyncService.actualizarIngrediente(evento.getId(), evento.getStockActual(), evento.getUmbralAlerta());
        
        // Recalcular stock de todos los platos que usan este ingrediente y emitir SSE
        cartaSyncService.recalcularStockYNotificar(evento.getId());
        
        // Emitir evento SSE para actualizar UI
        Map<String, Object> eventData = Map.of(
            "ingredienteId", evento.getId(),
            "nombre", evento.getNombre(),
            "stockActual", evento.getStockActual(),
            "umbralAlerta", evento.getUmbralAlerta()
        );
        sseEmitterManager.broadcast("carta.stock_changed", eventData);
    }

    private void procesarStockBajo(IngredienteStockChangedEvent evento) {
        log.warn("ALERTA: Stock bajo para ingrediente: {} - Stock: {} (Umbral: {})", 
                evento.getNombre(), evento.getStockActual(), evento.getUmbralAlerta());
        
        // Actualizar ingrediente con alerta
        cartaSyncService.actualizarIngrediente(evento.getId(), evento.getStockActual(), evento.getUmbralAlerta());
        
        // Recalcular stock de todos los platos que usan este ingrediente y emitir SSE
        cartaSyncService.recalcularStockYNotificar(evento.getId());
        
        // Emitir evento SSE de alerta
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("ingredienteId", evento.getId());
        eventData.put("nombre", evento.getNombre());
        eventData.put("stockActual", evento.getStockActual());
        eventData.put("umbralAlerta", evento.getUmbralAlerta());
        eventData.put("tipoAlerta", "STOCK_BAJO");
        
        sseEmitterManager.broadcast("carta.stock_bajo", eventData);
        log.info("[SSE] Evento carta.stock_bajo emitido para ingrediente {}", evento.getId());
    }
    
    private void procesarTipoCartaActualizado(TipoCartaUpdatedEvent evento) {
        log.info("Tipo de carta actualizado: {} - Platos: {}", evento.getNombre(),
                evento.getPlatos() != null ? evento.getPlatos().size() : 0);

        // Convertir platos del evento al formato esperado por el servicio
        List<com.suances.sala.client.dto.PlatoInfoSyncDto> platosSync = null;
        if (evento.getPlatos() != null) {
            platosSync = evento.getPlatos().stream()
                    .map(p -> {
                        com.suances.sala.client.dto.PlatoInfoSyncDto dto = new com.suances.sala.client.dto.PlatoInfoSyncDto();
                        dto.setId(p.getId());
                        dto.setNombre(p.getNombre());
                        return dto;
                    })
                    .collect(java.util.stream.Collectors.toList());
        }

        // Actualizar tipo de carta y sincronizar platos
        cartaSyncService.actualizarTipoCarta(
                evento.getId(),
                evento.getNombre(),
                evento.getHoraInicio(),
                evento.getHoraFin(),
                evento.getActivo(),
                platosSync
        );

        log.info("Tipo de carta {} procesado correctamente", evento.getId());
    }

    private void procesarTipoCartaPlatosActualizados(com.suances.sala.event.dto.TipoCartaPlatosChangedEvent evento) {
        log.info("Platos de tipo de carta actualizados: {} - {} platos", evento.getNombre(),
                evento.getPlatos() != null ? evento.getPlatos().size() : 0);

        // Convertir platos del evento al formato esperado por el servicio
        List<com.suances.sala.client.dto.PlatoInfoSyncDto> platosSync = null;
        if (evento.getPlatos() != null) {
            platosSync = evento.getPlatos().stream()
                    .map(p -> {
                        com.suances.sala.client.dto.PlatoInfoSyncDto dto = new com.suances.sala.client.dto.PlatoInfoSyncDto();
                        dto.setId(p.getId());
                        dto.setNombre(p.getNombre());
                        return dto;
                    })
                    .collect(java.util.stream.Collectors.toList());
        }

        // Actualizar tipo de carta y sincronizar platos (esto emitirá el SSE)
        cartaSyncService.actualizarTipoCarta(
                evento.getTipoCartaId(),
                evento.getNombre(),
                evento.getHoraInicio(),
                evento.getHoraFin(),
                evento.getActivo(),
                platosSync
        );

        log.info("Tipo de carta {} con platos actualizado correctamente", evento.getTipoCartaId());
    }
}
