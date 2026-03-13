package com.suances.reservas.service;

import com.suances.reservas.domain.model.FranjaHoraria;
import com.suances.reservas.domain.model.Mesa;
import com.suances.reservas.domain.model.Reserva;
import com.suances.reservas.domain.model.enums.BloqueoTipo;
import com.suances.reservas.domain.model.enums.ReservaEstado;
import com.suances.reservas.domain.model.enums.ReservaOrigen;
import com.suances.reservas.dto.ComandaReservaRequest;
import com.suances.reservas.dto.MesasOcupadasResponse;
import com.suances.reservas.dto.ReservaRequest;
import com.suances.reservas.dto.ReservaResponse;
import com.suances.reservas.dto.UpdateReservaRequest;
import com.suances.reservas.event.ReservaEventProducer;
import com.suances.reservas.event.ReservaUpdatedEvent;
import com.suances.reservas.event.SseEmitterManager;
import com.suances.reservas.exception.BusinessRuleException;
import com.suances.reservas.exception.ResourceNotFoundException;
import com.suances.reservas.repository.BloqueoRepository;
import com.suances.reservas.repository.FranjaRepository;
import com.suances.reservas.repository.MesaRepository;
import com.suances.reservas.repository.ReservaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReservaService {

    private static final Logger logger = LoggerFactory.getLogger(ReservaService.class);
    private static final String CODIGO_PREFIX = "RSV-";

    private final MesaRepository mesaRepository;
    private final FranjaRepository franjaRepository;
    private final ReservaRepository reservaRepository;
    private final BloqueoRepository bloqueoRepository;
    private final ReservaEventProducer eventProducer;
    private final SseEmitterManager sseEmitterManager;
    private final SecureRandom random = new SecureRandom();

    public ReservaService(MesaRepository mesaRepository,
                          FranjaRepository franjaRepository,
                          ReservaRepository reservaRepository,
                          BloqueoRepository bloqueoRepository,
                          ReservaEventProducer eventProducer,
                          SseEmitterManager sseEmitterManager) {
        this.mesaRepository = mesaRepository;
        this.franjaRepository = franjaRepository;
        this.reservaRepository = reservaRepository;
        this.bloqueoRepository = bloqueoRepository;
        this.eventProducer = eventProducer;
        this.sseEmitterManager = sseEmitterManager;
    }

    @Transactional
    public ReservaResponse crearReservaManual(ReservaRequest request) {
        Mesa mesa = mesaRepository.findById(request.mesaId())
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada"));
        FranjaHoraria franja = franjaRepository.findById(request.franjaId())
                .orElseThrow(() -> new ResourceNotFoundException("Franja no encontrada"));

        validarCapacidad(mesa, request.comensales(), Boolean.TRUE.equals(request.force()));
        verificarDisponibilidad(mesa, request.fecha(), franja.getId(), Boolean.TRUE.equals(request.force()));

        Reserva reserva = new Reserva();
        reserva.setMesa(mesa);
        reserva.setFranja(franja);
        reserva.setFecha(request.fecha());
        reserva.setComensales(request.comensales());
        reserva.setNombreCliente(request.nombreCliente());
        reserva.setTelefono(request.telefono());
        reserva.setEmail(request.email());
        reserva.setNotas(request.notas());
        reserva.setOrigen(ReservaOrigen.MANUAL);
        reserva.setEstado(ReservaEstado.CONFIRMADA);
        reserva.setCodigo(generarCodigo());

        Reserva guardada = reservaRepository.save(reserva);
        ReservaResponse response = map(guardada);
        logger.info("[RESERVA] Creando reserva - id: {}, codigo: {}, mesa: {}, fecha: {}, franja: {}", 
            response.id(), response.codigo(), response.mesaId(), response.fecha(), response.franjaId());
        eventProducer.publish("reserva.created", response);
        sseEmitterManager.broadcast("reserva.created", response);
        logger.info("[RESERVA] Evento publicado: reserva.created para reserva {}", response.codigo());
        return response;
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> listar(LocalDate fecha, ReservaEstado estado) {
        if (fecha != null && estado != null) {
            return reservaRepository.findByFechaAndEstado(fecha, estado).stream().map(this::map).toList();
        }
        return reservaRepository.findAll().stream().map(this::map).toList();
    }

    @Transactional
    public ReservaResponse cancelar(UUID id, String motivo) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada"));
        reserva.setEstado(ReservaEstado.CANCELADA);
        reserva.setNotas(motivo);
        ReservaResponse response = map(reserva);
        logger.info("[RESERVA] Cancelando reserva - id: {}, codigo: {}, motivo: {}", 
            response.id(), response.codigo(), motivo);
        eventProducer.publish("reserva.cancelled", response);
        sseEmitterManager.broadcast("reserva.cancelled", response);
        logger.info("[RESERVA] Evento publicado: reserva.cancelled para reserva {}", response.codigo());
        return response;
    }

    @Transactional
    public ReservaResponse actualizarReserva(UUID id, UpdateReservaRequest request) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada"));

        Mesa mesaAnterior = reserva.getMesa();
        UUID franjaAnteriorId = reserva.getFranja().getId();
        LocalDate fechaAnterior = reserva.getFecha();
        Short comensalesAnterior = reserva.getComensales();

        boolean mesaCambio = request.mesaId() != null && !request.mesaId().equals(reserva.getMesa().getId());
        boolean fechaCambio = request.fecha() != null && !request.fecha().equals(reserva.getFecha());
        boolean faixaCambio = request.franjaId() != null && !request.franjaId().equals(reserva.getFranja().getId());
        
        Short nuevosComensales = request.comensales() != null ? request.comensales() : reserva.getComensales();
        boolean capacidadCambio = request.comensales() != null && request.comensales() > reserva.getComensales();

        Mesa mesaActual = request.mesaId() != null && mesaCambio 
                ? mesaRepository.findById(request.mesaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada"))
                : reserva.getMesa();
        
        LocalDate nuevaFecha = request.fecha() != null ? request.fecha() : reserva.getFecha();
        UUID nuevaFranjaId = request.franjaId() != null ? request.franjaId() : reserva.getFranja().getId();

        if (mesaCambio || fechaCambio || faixaCambio) {
            boolean esMismaCombinacion = !mesaCambio && !fechaCambio && !faixaCambio;
            
            if (!esMismaCombinacion) {
                validarCapacidad(mesaActual, nuevosComensales, Boolean.TRUE.equals(request.force()));
                verificarDisponibilidad(mesaActual, nuevaFecha, nuevaFranjaId, Boolean.TRUE.equals(request.force()));
            }
        } else if (capacidadCambio) {
            validarCapacidad(mesaActual, nuevosComensales, Boolean.TRUE.equals(request.force()));
        }

        if (request.mesaId() != null && mesaCambio) {
            reserva.setMesa(mesaActual);
        }
        if (request.fecha() != null) {
            reserva.setFecha(request.fecha());
        }
        if (request.franjaId() != null) {
            FranjaHoraria nuevaFranja = franjaRepository.findById(request.franjaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Franja no encontrada"));
            reserva.setFranja(nuevaFranja);
        }

        if (request.comensales() != null) {
            reserva.setComensales(request.comensales());
        }
        if (request.nombreCliente() != null) {
            reserva.setNombreCliente(request.nombreCliente());
        }
        if (request.telefono() != null) {
            reserva.setTelefono(request.telefono());
        }
        if (request.email() != null) {
            reserva.setEmail(request.email());
        }
        if (request.notas() != null) {
            reserva.setNotas(request.notas());
        }

        Reserva guardada = reservaRepository.save(reserva);
        ReservaResponse response = map(guardada);
        
        // Crear evento específico para actualización con mesa anterior
        ReservaUpdatedEvent updatedEvent = new ReservaUpdatedEvent(
            java.util.UUID.randomUUID(),
            response.id(),
            response.mesaId(),
            response.franjaId(),
            response.fecha(),
            response.codigo(),
            response.estado().name(),
            response.nombreCliente(),
            response.telefono(),
            (int) response.comensales(),
            mesaCambio ? mesaAnterior.getId() : null
        );
        
        logger.info("[RESERVA] Actualizando reserva - id: {}, codigo: {}, cambios: mesa={}, fecha={}, faixa={}, comensales={}", 
            response.id(), response.codigo(), mesaCambio, fechaCambio, faixaCambio, capacidadCambio);
        eventProducer.publish("reserva.updated", updatedEvent);
        sseEmitterManager.broadcast("reserva.updated", updatedEvent);
        logger.info("[RESERVA] Evento publicado: reserva.updated para reserva {}", response.codigo());
        
        return response;
    }

    @Transactional(readOnly = true)
    public List<UUID> getMesasOcupadas(LocalDate fecha, UUID franjaId) {
        return reservaRepository.findByFechaAndFranja_IdAndEstadoNot(fecha, franjaId, ReservaEstado.CANCELADA)
                .stream()
                .map(reserva -> reserva.getMesa().getId())
                .collect(Collectors.toList());
    }

    private void validarCapacidad(Mesa mesa, short comensales, boolean force) {
        if (mesa.getCapacidad() < comensales && !force) {
            throw new BusinessRuleException("La mesa no soporta el número de comensales");
        }
    }

    private void verificarDisponibilidad(Mesa mesa, LocalDate fecha, UUID franjaId, boolean force) {
        boolean exists = reservaRepository.existsByMesaAndFechaAndFranja_IdAndEstadoNot(
                mesa, fecha, franjaId, ReservaEstado.CANCELADA);
        if (exists && !force) {
            throw new BusinessRuleException("La mesa ya tiene una reserva para esa franja");
        }

        var bloqueos = bloqueoRepository.findByMesaAndFechaDesdeLessThanEqualAndFechaHastaGreaterThanEqual(mesa, fecha, fecha);
        boolean bloqueoTotal = bloqueos.stream().anyMatch(b -> b.getTipo() == BloqueoTipo.TOTAL || b.getTipo() == BloqueoTipo.EVENTO || b.getTipo() == BloqueoTipo.EVENTO_AUTO);
        if (bloqueoTotal && !force) {
            throw new BusinessRuleException("La mesa está bloqueada");
        }
    }

    @Transactional
    public ReservaResponse crearReservaDesdeComanda(ComandaReservaRequest request) {
        Mesa mesa = mesaRepository.findById(request.mesaId())
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada"));
        
        // Verificar que la mesa pertenece a la sala indicada
        if (!mesa.getSala().getId().equals(request.salaId())) {
            throw new BusinessRuleException("La mesa no pertenece a la sala indicada");
        }
        
        // Obtener fecha actual en zona horaria de Madrid
        LocalDate fecha = LocalDate.now(ZoneId.of("Europe/Madrid"));
        
        // Obtener hora actual para determinar franja
        LocalTime horaActual = LocalTime.now(ZoneId.of("Europe/Madrid"));
        
        // Determinar franja según hora actual
        FranjaHoraria franja = determinarFranjaPorHora(horaActual);
        
        // Crear reserva WALKIN
        Reserva reserva = new Reserva();
        reserva.setMesa(mesa);
        reserva.setFranja(franja);
        reserva.setFecha(fecha);
        reserva.setComensales(request.numeroComensales());
        reserva.setNombreCliente("Mesa de " + request.camareroNombre());
        reserva.setTelefono("0000");
        reserva.setEmail(null);
        reserva.setNotas("Reserva creada automáticamente desde comanda");
        reserva.setOrigen(ReservaOrigen.WALKIN);
        reserva.setEstado(ReservaEstado.CONFIRMADA);
        reserva.setCodigo(generarCodigo());
        
        // Forzar la creación sin validaciones de disponibilidad
        Reserva guardada = reservaRepository.save(reserva);
        ReservaResponse response = map(guardada);
        
        logger.info("[RESERVA] Creando reserva desde comanda - id: {}, codigo: {}, mesa: {}, fecha: {}, franja: {}, camarero: {}", 
            response.id(), response.codigo(), response.mesaId(), response.fecha(), response.franjaId(), request.camareroNombre());
        
        eventProducer.publish("reserva.created", response);
        sseEmitterManager.broadcast("reserva.created", response);
        
        logger.info("[RESERVA] Evento publicado: reserva.created para reserva {}", response.codigo());
        return response;
    }
    
    private FranjaHoraria determinarFranjaPorHora(LocalTime hora) {
        // Buscar todas las franjas activas
        List<FranjaHoraria> franjas = franjaRepository.findAll().stream()
                .filter(FranjaHoraria::isActiva)
                .toList();
        
        // Buscar franja que contenga la hora actual
        Optional<FranjaHoraria> franjaActual = franjas.stream()
                .filter(f -> !hora.isBefore(f.getHoraInicio()) && hora.isBefore(f.getHoraFin()))
                .findFirst();
        
        if (franjaActual.isPresent()) {
            return franjaActual.get();
        }
        
        // Si no hay franja para la hora actual, usar la primera disponible o crear una por defecto
        if (!franjas.isEmpty()) {
            // Buscar primero COMIDA, luego CENA, luego cualquiera
            Optional<FranjaHoraria> comida = franjas.stream()
                    .filter(f -> f.getTipo().name().equals("COMIDA"))
                    .findFirst();
            if (comida.isPresent()) {
                return comida.get();
            }
            
            Optional<FranjaHoraria> cena = franjas.stream()
                    .filter(f -> f.getTipo().name().equals("CENA"))
                    .findFirst();
            if (cena.isPresent()) {
                return cena.get();
            }
            
            return franjas.get(0);
        }
        
        throw new BusinessRuleException("No hay franjas horarias configuradas");
    }

    private ReservaResponse map(Reserva reserva) {
        return new ReservaResponse(
                reserva.getId(),
                reserva.getCodigo(),
                reserva.getMesa().getId(),
                reserva.getFranja().getId(),
                reserva.getFecha(),
                reserva.getComensales(),
                reserva.getEstado(),
                reserva.getOrigen(),
                reserva.getNombreCliente(),
                reserva.getTelefono(),
                reserva.getEmail());
    }

    private String generarCodigo() {
        int value = random.nextInt(0xFFFFF);
        return CODIGO_PREFIX + String.format(Locale.ROOT, "%05X", value);
    }
}
