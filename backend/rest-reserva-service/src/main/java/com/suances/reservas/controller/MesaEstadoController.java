package com.suances.reservas.controller;

import com.suances.reservas.domain.model.Bloqueo;
import com.suances.reservas.domain.model.Mesa;
import com.suances.reservas.domain.model.Reserva;
import com.suances.reservas.domain.model.enums.BloqueoTipo;
import com.suances.reservas.domain.model.enums.ReservaEstado;
import com.suances.reservas.dto.MesaEstadoResponse;
import com.suances.reservas.repository.BloqueoRepository;
import com.suances.reservas.repository.MesaRepository;
import com.suances.reservas.repository.ReservaRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/mesas")
public class MesaEstadoController {

    private final MesaRepository mesaRepository;
    private final ReservaRepository reservaRepository;
    private final BloqueoRepository bloqueoRepository;

    public MesaEstadoController(MesaRepository mesaRepository,
                               ReservaRepository reservaRepository,
                               BloqueoRepository bloqueoRepository) {
        this.mesaRepository = mesaRepository;
        this.reservaRepository = reservaRepository;
        this.bloqueoRepository = bloqueoRepository;
    }

    @GetMapping("/estado-diario")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER','SERVICE')")
    public ResponseEntity<List<MesaEstadoResponse>> getEstadoDiario(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) UUID franjaId) {
        
        List<Mesa> mesasActivas = mesaRepository.findByActivaTrue();
        
        // Si se proporciona franjaId, filtrar por esa franja
        // Si no, traer todas las reservas del día (de todas las franjas)
        Map<UUID, Reserva> reservasPorMesa;
        if (franjaId != null) {
            List<Reserva> reservasDelDia = reservaRepository.findByFechaAndFranja_IdAndEstadoNot(
                    fecha, franjaId, ReservaEstado.CANCELADA);
            reservasPorMesa = reservasDelDia.stream()
                    .collect(Collectors.toMap(r -> r.getMesa().getId(), r -> r));
        } else {
            // Sin filtro de franja: traer todas las reservas activas del día
            List<Reserva> todasReservas = reservaRepository.findByFechaAndEstadoNot(
                    fecha, ReservaEstado.CANCELADA);
            reservasPorMesa = todasReservas.stream()
                    .collect(Collectors.toMap(r -> r.getMesa().getId(), r -> r, (r1, r2) -> r1));
        }
        
        List<Bloqueo> bloqueosDelDia = bloqueoRepository.findByFechaDesdeLessThanEqualAndFechaHastaGreaterThanEqual(
                fecha, fecha);
        
        // Filtrar bloqueos por franja si se especificó
        List<Bloqueo> bloqueosFiltrados;
        if (franjaId != null) {
            bloqueosFiltrados = bloqueosDelDia.stream()
                    .filter(b -> {
                        if (b.getFranjas() == null || b.getFranjas().isEmpty()) {
                            return true;
                        }
                        return b.getFranjas().contains(franjaId.toString());
                    })
                    .toList();
        } else {
            bloqueosFiltrados = bloqueosDelDia;
        }
        
        Map<UUID, Bloqueo> bloqueosPorMesa = bloqueosFiltrados.stream()
                .collect(Collectors.toMap(b -> b.getMesa().getId(), b -> b, (b1, b2) -> b1));
        
        List<MesaEstadoResponse> estadoMesas = mesasActivas.stream()
                .map(mesa -> mapToEstadoResponse(mesa, reservasPorMesa.get(mesa.getId()), 
                                                bloqueosPorMesa.get(mesa.getId())))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(estadoMesas);
    }

    private MesaEstadoResponse mapToEstadoResponse(Mesa mesa, Reserva reserva, Bloqueo bloqueo) {
        MesaEstadoResponse.MesaEstado estado;
        MesaEstadoResponse.ReservaInfo reservaInfo = null;
        MesaEstadoResponse.BloqueoInfo bloqueoInfo = null;

        if (reserva != null) {
            estado = MesaEstadoResponse.MesaEstado.RESERVADA;
            reservaInfo = new MesaEstadoResponse.ReservaInfo(
                    reserva.getId(),
                    reserva.getCodigo(),
                    reserva.getNombreCliente(),
                    reserva.getTelefono(),
                    reserva.getComensales(),
                    reserva.getFranja().getId(),
                    reserva.getFranja().getHoraInicio(),
                    reserva.getFranja().getHoraFin()
            );
        } else if (bloqueo != null) {
            estado = MesaEstadoResponse.MesaEstado.BLOQUEADA;
            bloqueoInfo = new MesaEstadoResponse.BloqueoInfo(
                    bloqueo.getTipo(),
                    bloqueo.getMotivo()
            );
        } else {
            estado = MesaEstadoResponse.MesaEstado.LIBRE;
        }

        return new MesaEstadoResponse(
                mesa.getId(),
                mesa.getNumero(),
                mesa.getSala().getId(),
                mesa.getCapacidad(),
                mesa.getPosX(),
                mesa.getPosY(),
                estado,
                reservaInfo,
                bloqueoInfo
        );
    }
}
