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
                case "carta.pedido_procesado":
                    procesarPedidoProcesado(json);
                    break;
                case "carta.platos_afectados_stock":
                    procesarPlatosAfectadosStock(json);
                    break;
                case "carta.platos_stock_mejorado":
                    procesarPlatosStockMejorado(json);
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

    private void procesarPedidoProcesado(String json) {
        try {
            com.fasterxml.jackson.databind.JsonNode rootNode = objectMapper.readTree(json);

            java.util.UUID comandaId = java.util.UUID.fromString(rootNode.get("comandaId").asText());
            java.util.UUID mesaId = rootNode.has("mesaId") ? java.util.UUID.fromString(rootNode.get("mesaId").asText()) : null;
            Integer numeroRonda = rootNode.has("numeroRonda") ? rootNode.get("numeroRonda").asInt() : null;
            String tipoRonda = rootNode.has("tipoRonda") ? rootNode.get("tipoRonda").asText() : null;
            java.util.UUID camareroId = rootNode.has("camareroId") ? java.util.UUID.fromString(rootNode.get("camareroId").asText()) : null;

            log.info("Pedido procesado recibido: comanda={}, ronda={} - Reenviando via SSE", comandaId, numeroRonda);

            // Reenviar el evento completo via SSE a los clientes conectados
            java.util.Map<String, Object> eventData = new java.util.HashMap<>();
            eventData.put("comandaId", comandaId);
            eventData.put("mesaId", mesaId);
            eventData.put("numeroRonda", numeroRonda);
            eventData.put("tipoRonda", tipoRonda);
            eventData.put("camareroId", camareroId);
            eventData.put("timestamp", java.time.OffsetDateTime.now().toString());

            // Incluir items e ingredientes si están presentes
            if (rootNode.has("items")) {
                eventData.put("items", objectMapper.readValue(rootNode.get("items").toString(), java.util.List.class));
            }

            sseEmitterManager.broadcast("carta.pedido_procesado", eventData);
            log.info("[SSE] Evento carta.pedido_procesado reenviado: comanda={}, ronda={}", comandaId, numeroRonda);

        } catch (Exception e) {
            log.error("Error al procesar pedido procesado", e);
        }
    }

    private void procesarPlatosAfectadosStock(String json) {
        try {
            com.fasterxml.jackson.databind.JsonNode rootNode = objectMapper.readTree(json);

            log.info("Procesando platos afectados por stock bajo");

            // Si la lista está vacía, limpiar todos los platos (no hay stock bajo)
            if (!rootNode.has("platos") || rootNode.get("platos").isEmpty()) {
                log.info("Lista de platos vacía, limpiando todos los flags de stock bajo");
                cartaSyncService.limpiarTodosStockBajo();
                
                java.util.Map<String, Object> eventData = new java.util.HashMap<>();
                eventData.put("accion", "limpiar_todos");
                eventData.put("stockBajo", false);
                eventData.put("timestamp", java.time.OffsetDateTime.now().toString());
                sseEmitterManager.broadcast("carta.plato_stock_cleared", eventData);
                log.info("[SSE] Evento carta.plato_stock_cleared emitido");
                return;
            }

            // Actualizar stockBajo=true para los platos afectados
            for (com.fasterxml.jackson.databind.JsonNode platoNode : rootNode.get("platos")) {
                java.util.UUID platoId = java.util.UUID.fromString(platoNode.get("platoId").asText());
                String nombre = platoNode.get("nombre").asText();

                // Actualizar en BD
                cartaSyncService.actualizarStockBajoPlato(platoId, true);

                // Preparar datos de ingredientes bajos
                java.util.List<java.util.Map<String, Object>> ingredientesBajos = new java.util.ArrayList<>();
                if (platoNode.has("ingredientesBajos")) {
                    for (com.fasterxml.jackson.databind.JsonNode ingNode : platoNode.get("ingredientesBajos")) {
                        java.util.Map<String, Object> ingData = new java.util.HashMap<>();
                        ingData.put("ingredienteId", ingNode.get("ingredienteId").asText());
                        ingData.put("nombre", ingNode.get("nombre").asText());
                        ingData.put("stockActual", ingNode.get("stockActual").asDouble());
                        ingData.put("umbralAlerta", ingNode.get("umbralAlerta").asDouble());
                        ingData.put("unidadMedida", ingNode.get("unidadMedida").asText());
                        ingredientesBajos.add(ingData);
                    }
                }

                // Emitir SSE
                java.util.Map<String, Object> eventData = new java.util.HashMap<>();
                eventData.put("platoId", platoId);
                eventData.put("nombre", nombre);
                eventData.put("stockBajo", true);
                eventData.put("ingredientesBajos", ingredientesBajos);
                eventData.put("timestamp", java.time.OffsetDateTime.now().toString());

                sseEmitterManager.broadcast("carta.plato_stock_changed", eventData);
                log.info("[SSE] Evento carta.plato_stock_changed emitido para plato {} - stockBajo: true", platoId);
            }

            log.info("Platos afectados por stock procesados correctamente");

        } catch (Exception e) {
            log.error("Error al procesar platos afectados por stock", e);
        }
    }

    private void procesarPlatosStockMejorado(String json) {
        try {
            com.fasterxml.jackson.databind.JsonNode rootNode = objectMapper.readTree(json);

            log.info("[SALA-STOCK] === PROCESANDO evento carta.platos_stock_mejorado ===");
            log.info("[SALA-STOCK] JSON recibido: {}", json);

            // Actualizar stockBajo=false para los platos recuperados
            if (rootNode.has("platos")) {
                log.info("[SALA-STOCK] Numero de platos en el evento: {}", rootNode.get("platos").size());
                for (com.fasterxml.jackson.databind.JsonNode platoNode : rootNode.get("platos")) {
                    java.util.UUID platoId = java.util.UUID.fromString(platoNode.get("platoId").asText());
                    String nombre = platoNode.get("nombre").asText();

                    log.info("[SALA-STOCK] Actualizando plato recuperado: {} ({})", nombre, platoId);

                    // Actualizar en BD
                    cartaSyncService.actualizarStockBajoPlato(platoId, false);

                    // Emitir SSE
                    java.util.Map<String, Object> eventData = new java.util.HashMap<>();
                    eventData.put("platoId", platoId);
                    eventData.put("nombre", nombre);
                    eventData.put("stockBajo", false);
                    eventData.put("ingredientesBajos", new java.util.ArrayList<>());
                    eventData.put("timestamp", java.time.OffsetDateTime.now().toString());

                    sseEmitterManager.broadcast("carta.plato_stock_changed", eventData);
                    log.info("[SALA-STOCK] === SSE emitido para plato {} - stockBajo: false", platoId);
                }
            } else {
                log.info("[SALA-STOCK] No hay platos en el evento (lista vacia)");
            }

            log.info("[SALA-STOCK] Platos con stock mejorado procesados correctamente");

        } catch (Exception e) {
            log.error("[SALA-STOCK] Error al procesar platos con stock mejorado", e);
        }
    }
}
