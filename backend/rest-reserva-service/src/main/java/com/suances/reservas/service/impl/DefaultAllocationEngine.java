package com.suances.reservas.service.impl;

import com.suances.reservas.domain.model.Bloqueo;
import com.suances.reservas.domain.model.Mesa;
import com.suances.reservas.domain.model.enums.BloqueoTipo;
import com.suances.reservas.domain.model.enums.ReservaEstado;
import com.suances.reservas.repository.BloqueoRepository;
import com.suances.reservas.repository.MesaRepository;
import com.suances.reservas.repository.ReservaRepository;
import com.suances.reservas.service.AllocationEngine;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class DefaultAllocationEngine implements AllocationEngine {

    private final MesaRepository mesaRepository;
    private final ReservaRepository reservaRepository;
    private final BloqueoRepository bloqueoRepository;

    public DefaultAllocationEngine(MesaRepository mesaRepository,
                                   ReservaRepository reservaRepository,
                                   BloqueoRepository bloqueoRepository) {
        this.mesaRepository = mesaRepository;
        this.reservaRepository = reservaRepository;
        this.bloqueoRepository = bloqueoRepository;
    }

    @Override
    public Optional<Mesa> allocateMesa(LocalDate fecha, UUID franjaId, short comensales, boolean incluirBloqueadasOnline) {
        List<Mesa> candidatas = mesaRepository.findByActivaTrueAndVisibleOnlineTrue().stream()
                .filter(m -> m.getCapacidad() >= comensales)
                .sorted(Comparator.comparing(Mesa::getCapacidad))
                .toList();

        for (Mesa mesa : candidatas) {
            boolean ocupada = reservaRepository.existsByMesaAndFechaAndFranja_IdAndEstadoNot(
                    mesa, fecha, franjaId, ReservaEstado.CANCELADA);
            if (ocupada) {
                continue;
            }

            boolean bloqueada = bloqueoRepository
                    .findByMesaAndFechaDesdeLessThanEqualAndFechaHastaGreaterThanEqual(mesa, fecha, fecha)
                    .stream()
                    .anyMatch(b -> bloqueaFranja(b, incluirBloqueadasOnline));

            if (!bloqueada) {
                return Optional.of(mesa);
            }
        }

        return Optional.empty();
    }

    private boolean bloqueaFranja(Bloqueo bloqueo, boolean incluirBloqueadasOnline) {
        if (bloqueo.getTipo() == BloqueoTipo.TOTAL || bloqueo.getTipo() == BloqueoTipo.EVENTO_AUTO || bloqueo.getTipo() == BloqueoTipo.EVENTO) {
            return true;
        }
        if (bloqueo.getTipo() == BloqueoTipo.ONLINE) {
            return incluirBloqueadasOnline;
        }
        return false;
    }
}
