package com.suances.reservas.service;

import com.suances.reservas.domain.model.FranjaHoraria;
import com.suances.reservas.domain.model.Mesa;
import com.suances.reservas.domain.model.Reserva;
import com.suances.reservas.domain.model.enums.BloqueoTipo;
import com.suances.reservas.domain.model.enums.ReservaEstado;
import com.suances.reservas.domain.model.enums.ReservaOrigen;
import com.suances.reservas.dto.ReservaRequest;
import com.suances.reservas.dto.ReservaResponse;
import com.suances.reservas.event.ReservaEventProducer;
import com.suances.reservas.exception.BusinessRuleException;
import com.suances.reservas.exception.ResourceNotFoundException;
import com.suances.reservas.repository.BloqueoRepository;
import com.suances.reservas.repository.FranjaRepository;
import com.suances.reservas.repository.MesaRepository;
import com.suances.reservas.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class ReservaService {

    private static final String CODIGO_PREFIX = "RSV-";

    private final MesaRepository mesaRepository;
    private final FranjaRepository franjaRepository;
    private final ReservaRepository reservaRepository;
    private final BloqueoRepository bloqueoRepository;
    private final ReservaEventProducer eventProducer;
    private final SecureRandom random = new SecureRandom();

    public ReservaService(MesaRepository mesaRepository,
                          FranjaRepository franjaRepository,
                          ReservaRepository reservaRepository,
                          BloqueoRepository bloqueoRepository,
                          ReservaEventProducer eventProducer) {
        this.mesaRepository = mesaRepository;
        this.franjaRepository = franjaRepository;
        this.reservaRepository = reservaRepository;
        this.bloqueoRepository = bloqueoRepository;
        this.eventProducer = eventProducer;
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
        eventProducer.publish("reserva.created", map(guardada));
        return map(guardada);
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
        eventProducer.publish("reserva.cancelled", response);
        return response;
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
