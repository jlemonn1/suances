package com.suances.reservas.service;

import com.suances.reservas.domain.model.FranjaHoraria;
import com.suances.reservas.domain.model.Mesa;
import com.suances.reservas.domain.model.Reserva;
import com.suances.reservas.domain.model.enums.ReservaEstado;
import com.suances.reservas.domain.model.enums.ReservaOrigen;
import com.suances.reservas.domain.model.enums.WaitlistEstado;
import com.suances.reservas.dto.DisponibilidadResponse;
import com.suances.reservas.dto.ReservaPublicaRequest;
import com.suances.reservas.dto.ReservaResponse;
import com.suances.reservas.event.ReservaEventProducer;
import com.suances.reservas.exception.BusinessRuleException;
import com.suances.reservas.exception.ResourceNotFoundException;
import com.suances.reservas.repository.FranjaRepository;
import com.suances.reservas.repository.MesaRepository;
import com.suances.reservas.repository.ReservaRepository;
import com.suances.reservas.repository.WaitlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ReservaPublicaService {

    private final AllocationEngine allocationEngine;
    private final FranjaRepository franjaRepository;
    private final ReservaRepository reservaRepository;
    private final WaitlistRepository waitlistRepository;
    private final MesaRepository mesaRepository;
    private final ReservaEventProducer eventProducer;

    public ReservaPublicaService(AllocationEngine allocationEngine,
                                 FranjaRepository franjaRepository,
                                 ReservaRepository reservaRepository,
                                 WaitlistRepository waitlistRepository,
                                 MesaRepository mesaRepository,
                                 ReservaEventProducer eventProducer) {
        this.allocationEngine = allocationEngine;
        this.franjaRepository = franjaRepository;
        this.reservaRepository = reservaRepository;
        this.waitlistRepository = waitlistRepository;
        this.mesaRepository = mesaRepository;
        this.eventProducer = eventProducer;
    }

    @Transactional
    public ReservaResponse crearReservaOnline(ReservaPublicaRequest request) {
        FranjaHoraria franja = franjaRepository.findById(request.franjaId())
                .orElseThrow(() -> new ResourceNotFoundException("Franja no encontrada"));

        Mesa mesa = allocationEngine.allocateMesa(request.fecha(), franja.getId(), request.comensales(), false)
                .orElseThrow(() -> {
                    crearEntradaWaitlist(request, franja);
                    return new BusinessRuleException("No hay mesas disponibles. Se creó entrada en lista de espera");
                });

        Reserva reserva = new Reserva();
        reserva.setMesa(mesa);
        reserva.setFranja(franja);
        reserva.setFecha(request.fecha());
        reserva.setComensales(request.comensales());
        reserva.setNombreCliente(request.nombre());
        reserva.setTelefono(request.telefono());
        reserva.setEmail(request.email());
        reserva.setNotas(request.preferencias());
        reserva.setOrigen(ReservaOrigen.ONLINE);
        reserva.setEstado(ReservaEstado.PENDIENTE);
        reserva.setCodigo("RSV-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());

        Reserva guardada = reservaRepository.save(reserva);
        ReservaResponse response = map(guardada);
        eventProducer.publish("reserva.created", response);
        return response;
    }

    @Transactional(readOnly = true)
    public ReservaResponse consultarPorCodigo(String codigo) {
        Reserva reserva = reservaRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada"));
        return map(reserva);
    }

    @Transactional(readOnly = true)
    public List<DisponibilidadResponse> consultarDisponibilidad(LocalDate fecha) {
        var mesasActivas = mesaRepository.findByActivaTrueAndVisibleOnlineTrue();
        return franjaRepository.findAll().stream()
                .filter(FranjaHoraria::isActiva)
                .map(franja -> {
                    long mesasTotales = mesasActivas.size();
                    long ocupadas = reservaRepository.findByFechaAndEstado(fecha, ReservaEstado.CONFIRMADA).stream()
                            .filter(reserva -> reserva.getFranja().getId().equals(franja.getId()))
                            .count();
                    return new DisponibilidadResponse(
                            fecha,
                            franja.getId(),
                            (int) Math.max(mesasTotales - ocupadas, 0),
                            (int) mesasTotales);
                })
                .toList();
    }

    private void crearEntradaWaitlist(ReservaPublicaRequest request, FranjaHoraria franja) {
        var entry = new com.suances.reservas.domain.model.WaitlistEntry();
        entry.setFecha(request.fecha());
        entry.setFranja(franja);
        entry.setComensales(request.comensales());
        entry.setNombreCliente(request.nombre());
        entry.setTelefono(request.telefono());
        entry.setPrioridad(request.comensales());
        entry.setEstado(WaitlistEstado.WAITING);
        waitlistRepository.save(entry);
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
}
