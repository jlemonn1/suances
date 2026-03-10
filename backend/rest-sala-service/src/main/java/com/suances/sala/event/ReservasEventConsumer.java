package com.suances.sala.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.suances.sala.domain.model.EventoProcesado;
import com.suances.sala.domain.model.MesaOperativa;
import com.suances.sala.domain.model.enums.MesaEstadoOperativo;
import com.suances.sala.event.dto.ReservaCancelledEvent;
import com.suances.sala.event.dto.ReservaCreatedEvent;
import com.suances.sala.event.dto.ReservaUpdatedEvent;
import com.suances.sala.repository.EventoProcesadoRepository;
import com.suances.sala.repository.MesaOperativaRepository;
import com.suances.sala.service.MesaOperativaService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class ReservasEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(ReservasEventConsumer.class);

    @Value("${app.redis.stream-input}")
    private String streamInput;

    @Value("${app.redis.consumer-group}")
    private String consumerGroup;

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final EventoProcesadoRepository eventoProcesadoRepository;
    private final MesaOperativaRepository mesaOperativaRepository;
    private final SseEmitterManager sseEmitterManager;
    private final MesaOperativaService mesaOperativaService;

    private ExecutorService executor;
    private volatile boolean activo = true;

    public ReservasEventConsumer(StringRedisTemplate redisTemplate,
                                 ObjectMapper objectMapper,
                                 EventoProcesadoRepository eventoProcesadoRepository,
                                 MesaOperativaRepository mesaOperativaRepository,
                                 SseEmitterManager sseEmitterManager,
                                 MesaOperativaService mesaOperativaService) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.eventoProcesadoRepository = eventoProcesadoRepository;
        this.mesaOperativaRepository = mesaOperativaRepository;
        this.sseEmitterManager = sseEmitterManager;
        this.mesaOperativaService = mesaOperativaService;
    }

    @PostConstruct
    public void iniciarConsumidor() {
        log.info("Iniciando consumidor de eventos de reservas...");
        inicializarConsumerGroup();
        executor = Executors.newSingleThreadExecutor();
        executor.submit(this::consumirEventos);
    }

    @PreDestroy
    public void detenerConsumidor() {
        log.info("Deteniendo consumidor de eventos...");
        activo = false;
        if (executor != null && !executor.isShutdown()) {
            executor.shutdownNow();
        }
    }

    private void inicializarConsumerGroup() {
        try {
            redisTemplate.opsForStream().createGroup(streamInput, ReadOffset.from("0"), consumerGroup);
            log.info("Consumer group '{}' creado exitosamente", consumerGroup);
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("BUSYGROUP")) {
                log.info("Consumer group '{}' ya existe", consumerGroup);
            } else {
                log.warn("No se pudo crear consumer group: {}", e.getMessage());
            }
        }
    }

    private void consumirEventos() {
        while (activo && !Thread.currentThread().isInterrupted()) {
            try {
                List<MapRecord<String, Object, Object>> registros = redisTemplate.opsForStream().read(
                        Consumer.from(consumerGroup, "sala-consumer"),
                        StreamReadOptions.empty().count(1).block(Duration.ofSeconds(5)),
                        StreamOffset.create(streamInput, ReadOffset.lastConsumed()));

                if (registros != null && !registros.isEmpty()) {
                    for (MapRecord<String, Object, Object> registro : registros) {
                        procesarEvento(registro);
                    }
                }
            } catch (Exception e) {
                if (!activo) break;
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
        String streamEventId = registro.getId().toString();
        Map<Object, Object> datos = registro.getValue();

        try {
            // Extraer eventId del body del mensaje (UUID válido), no del ID del stream
            String eventId = (String) datos.get("eventId");
            String tipo = (String) datos.get("type");
            String json = (String) datos.get("data");

            log.info("Procesando evento: {} - ID: {}", tipo, eventId);

            // Verificar idempotencia usando el eventId del body
            if (eventId == null || eventoProcesadoRepository.existsByEventId(java.util.UUID.fromString(eventId))) {
                log.info("Evento ya procesado o sin eventId, ignorando: {}", eventId);
                redisTemplate.opsForStream().acknowledge(streamInput, consumerGroup, streamEventId);
                return;
            }

            switch (tipo) {
                case "reserva.created":
                    ReservaCreatedEvent reservaCreated = objectMapper.readValue(json, ReservaCreatedEvent.class);
                    procesarReservaCreada(reservaCreated);
                    break;
                case "reserva.updated":
                    ReservaUpdatedEvent reservaUpdated = objectMapper.readValue(json, ReservaUpdatedEvent.class);
                    procesarReservaActualizada(reservaUpdated);
                    break;
                case "reserva.cancelled":
                    ReservaCancelledEvent reservaCancelled = objectMapper.readValue(json, ReservaCancelledEvent.class);
                    procesarReservaCancelada(reservaCancelled);
                    break;
                default:
                    log.warn("Tipo de evento no manejado: {}", tipo);
            }

            // Marcar como procesado
            if (eventId != null) {
                EventoProcesado eventoProcesado = new EventoProcesado();
                eventoProcesado.setEventId(java.util.UUID.fromString(eventId));
                eventoProcesado.setTipoEvento(tipo);
                eventoProcesado.setOrigen("reservas-service");
                eventoProcesadoRepository.save(eventoProcesado);
            }

            // Acknowledge usando el streamEventId
            redisTemplate.opsForStream().acknowledge(streamInput, consumerGroup, streamEventId);

        } catch (Exception e) {
            log.error("Error al procesar evento del stream: {}", streamEventId, e);
        }
    }

    private void procesarReservaCreada(ReservaCreatedEvent evento) {
        log.info("Reserva creada para mesa {}: {}", evento.getMesaId(), evento.getCodigo());
        
        // Verificar que la reserva sea para el día actual
        if (!esReservaHoy(evento.getFecha())) {
            log.info("Reserva {} es para otra fecha ({}), ignorando", evento.getCodigo(), evento.getFecha());
            return;
        }
        
        // Verificar si la reserva es para la franja actual
        if (!esFranjaActual(evento.getFranjaId())) {
            log.debug("Reserva {} es para franja {} (no es la actual), sincronizando pero no emitiendo SSE", 
                    evento.getCodigo(), evento.getFranjaId());
            // Sincronizamos la mesa pero NO emitimos SSE
        }
        
        Optional<MesaOperativa> optionalMesa = mesaOperativaRepository.findById(evento.getMesaId());
        if (optionalMesa.isPresent()) {
            MesaOperativa mesa = optionalMesa.get();
            mesa.setReservaActualId(evento.getId());
            mesa.setNombreClienteReserva(evento.getNombreCliente());
            mesa.setFranjaIdReserva(evento.getFranjaId());
            mesa.setFechaReserva(LocalDate.parse(evento.getFecha()));
            mesaOperativaRepository.save(mesa);
            log.info("Mesa {} actualizada con reserva {} en franja {}", evento.getMesaId(), evento.getId(), evento.getFranjaId());
            
            // Emitir evento SSE a clientes conectados SOLO si es la franja actual
            if (esFranjaActual(evento.getFranjaId())) {
                Map<String, Object> eventData = Map.of(
                    "mesaId", evento.getMesaId(),
                    "reservaId", evento.getId(),
                    "estado", "RESERVADA",
                    "nombreCliente", evento.getNombreCliente(),
                    "franjaId", evento.getFranjaId(),
                    "codigo", evento.getCodigo()
                );
                sseEmitterManager.broadcast("mesa.reservada", eventData);
                log.info("[SSE] Evento mesa.reservada emitido para mesa {} (franja actual)", evento.getMesaId());
            }
        } else {
            log.warn("Mesa {} no encontrada para asignar reserva", evento.getMesaId());
        }
    }

    private void procesarReservaCancelada(ReservaCancelledEvent evento) {
        log.info("Reserva cancelada: {} - Motivo: {}", evento.getCodigo(), evento.getMotivo());
        
        // Verificar que la reserva sea para el día actual
        if (!esReservaHoy(evento.getFecha())) {
            log.info("Reserva cancelada {} es para otra fecha ({}), ignorando", evento.getCodigo(), evento.getFecha());
            return;
        }
        
        Optional<MesaOperativa> optionalMesa = mesaOperativaRepository.findById(evento.getMesaId());
        if (optionalMesa.isPresent()) {
            MesaOperativa mesa = optionalMesa.get();
            // Solo limpiar si la reserva cancelada es la que está activa y es de hoy
            if (mesa.getReservaActualId() != null && mesa.getReservaActualId().equals(evento.getId())) {
                // Guardar franjaId antes de limpiar
                UUID franjaIdReserva = mesa.getFranjaIdReserva();
                
                mesa.setReservaActualId(null);
                mesa.setNombreClienteReserva(null);
                mesa.setFranjaIdReserva(null);
                mesa.setFechaReserva(null);
                mesaOperativaRepository.save(mesa);
                log.info("Reserva liberada de mesa {}", evento.getMesaId());

                // Emitir evento SSE a clientes conectados SOLO si era la franja actual
                if (esFranjaActual(franjaIdReserva)) {
                    Map<String, Object> eventData = new HashMap<>();
                    eventData.put("mesaId", evento.getMesaId());
                    eventData.put("reservaId", evento.getId());
                    eventData.put("estado", "LIBRE");
                    eventData.put("nombreCliente", "");
                    eventData.put("franjaId", "");
                    eventData.put("codigo", evento.getCodigo());
                    sseEmitterManager.broadcast("mesa.liberada", eventData);
                    log.info("[SSE] Evento mesa.liberada emitido para mesa {} (franja actual)", evento.getMesaId());
                }
            }
        }
    }
    
    private void procesarReservaActualizada(ReservaUpdatedEvent evento) {
        log.info("Reserva actualizada {}: mesa {} -> {}, franja: {}, cliente: {}", 
            evento.getCodigo(), evento.getMesaIdAnterior(), evento.getMesaId(), 
            evento.getFranjaId(), evento.getNombreCliente());
        
        // Verificar que la reserva sea para el día actual
        if (!esReservaHoy(evento.getFecha())) {
            log.info("Reserva actualizada {} es para otra fecha ({}), ignorando", evento.getCodigo(), evento.getFecha());
            return;
        }
        
        // Verificar si es la franja actual
        boolean esFranjaActual = esFranjaActual(evento.getFranjaId());
        
        // Si hay cambio de mesa, liberar la mesa anterior
        if (evento.getMesaIdAnterior() != null && !evento.getMesaIdAnterior().equals(evento.getMesaId())) {
            Optional<MesaOperativa> mesaAnteriorOpt = mesaOperativaRepository.findById(evento.getMesaIdAnterior());
            if (mesaAnteriorOpt.isPresent()) {
                MesaOperativa mesaAnterior = mesaAnteriorOpt.get();
                // Solo limpiar si la reserva activa es la misma
                if (mesaAnterior.getReservaActualId() != null && mesaAnterior.getReservaActualId().equals(evento.getId())) {
                    // Guardar franjaId antes de limpiar
                    UUID franjaIdAnterior = mesaAnterior.getFranjaIdReserva();
                    
                    mesaAnterior.setReservaActualId(null);
                    mesaAnterior.setNombreClienteReserva(null);
                    mesaAnterior.setFranjaIdReserva(null);
                    mesaAnterior.setFechaReserva(null);
                    mesaOperativaRepository.save(mesaAnterior);
                    log.info("Mesa anterior {} liberada por cambio de reserva {}", evento.getMesaIdAnterior(), evento.getCodigo());
                    
                    // Emitir evento SSE para la mesa anterior SOLO si era franja actual
                    if (esFranjaActual(franjaIdAnterior)) {
                        Map<String, Object> eventDataAnterior = new HashMap<>();
                        eventDataAnterior.put("mesaId", evento.getMesaIdAnterior());
                        eventDataAnterior.put("reservaId", evento.getId());
                        eventDataAnterior.put("estado", "LIBRE");
                        eventDataAnterior.put("nombreCliente", "");
                        eventDataAnterior.put("franjaId", "");
                        eventDataAnterior.put("codigo", evento.getCodigo());
                        eventDataAnterior.put("tipo", "CAMBIO_MESA");
                        sseEmitterManager.broadcast("mesa.liberada", eventDataAnterior);
                        log.info("[SSE] Evento mesa.liberada emitido para mesa anterior {} (franja actual)", evento.getMesaIdAnterior());
                    }
                }
            }
        }
        
        // Actualizar (o crear) la reserva en la mesa actual
        Optional<MesaOperativa> mesaActualOpt = mesaOperativaRepository.findById(evento.getMesaId());
        if (mesaActualOpt.isPresent()) {
            MesaOperativa mesaActual = mesaActualOpt.get();
            mesaActual.setReservaActualId(evento.getId());
            mesaActual.setNombreClienteReserva(evento.getNombreCliente());
            mesaActual.setFranjaIdReserva(evento.getFranjaId());
            mesaActual.setFechaReserva(evento.getFecha());
            mesaOperativaRepository.save(mesaActual);
            log.info("Mesa {} actualizada con reserva {} (modificada)", evento.getMesaId(), evento.getCodigo());
            
            // Emitir evento SSE para la mesa actual SOLO si es franja actual
            if (esFranjaActual) {
                Map<String, Object> eventDataActual = Map.of(
                    "mesaId", evento.getMesaId(),
                    "reservaId", evento.getId(),
                    "estado", "RESERVADA",
                    "nombreCliente", evento.getNombreCliente(),
                    "franjaId", evento.getFranjaId(),
                    "codigo", evento.getCodigo(),
                    "tipo", "MODIFICADA"
                );
                sseEmitterManager.broadcast("mesa.reservada", eventDataActual);
                log.info("[SSE] Evento mesa.reservada emitido para mesa actual {} (franja actual)", evento.getMesaId());
            }
        } else {
            log.warn("Mesa actual {} no encontrada para actualizar reserva {}", evento.getMesaId(), evento.getCodigo());
        }
    }
    
    private boolean esReservaHoy(String fechaStr) {
        if (fechaStr == null || fechaStr.isEmpty()) {
            return false;
        }
        try {
            LocalDate fechaReserva = LocalDate.parse(fechaStr);
            return fechaReserva.equals(LocalDate.now());
        } catch (Exception e) {
            log.warn("Error parseando fecha: {}", fechaStr);
            return false;
        }
    }
    
    private boolean esReservaHoy(LocalDate fecha) {
        return fecha != null && fecha.equals(LocalDate.now());
    }
    
    /**
     * Verifica si la franjaId corresponde a la franja horaria actual.
     * 
     * @param franjaId ID de la franja a verificar
     * @return true si es la franja actual, false en caso contrario
     */
    private boolean esFranjaActual(UUID franjaId) {
        if (franjaId == null) {
            return false;
        }
        return mesaOperativaService.getFranjaIdActual()
                .map(franjaActual -> franjaActual.equals(franjaId))
                .orElse(false);
    }
}
