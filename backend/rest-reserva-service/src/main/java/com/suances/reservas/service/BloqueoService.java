package com.suances.reservas.service;

import com.suances.reservas.domain.model.Bloqueo;
import com.suances.reservas.domain.model.Mesa;
import com.suances.reservas.domain.model.enums.BloqueoTipo;
import com.suances.reservas.exception.ResourceNotFoundException;
import com.suances.reservas.repository.BloqueoRepository;
import com.suances.reservas.repository.MesaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class BloqueoService {

    private final BloqueoRepository bloqueoRepository;
    private final MesaRepository mesaRepository;

    public BloqueoService(BloqueoRepository bloqueoRepository, MesaRepository mesaRepository) {
        this.bloqueoRepository = bloqueoRepository;
        this.mesaRepository = mesaRepository;
    }

    @Transactional
    public UUID crearBloqueo(UUID mesaId, BloqueoTipo tipo, LocalDate desde, LocalDate hasta, String motivo) {
        Mesa mesa = mesaRepository.findById(mesaId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada"));
        Bloqueo bloqueo = new Bloqueo();
        bloqueo.setMesa(mesa);
        bloqueo.setTipo(tipo);
        bloqueo.setFechaDesde(desde);
        bloqueo.setFechaHasta(hasta);
        bloqueo.setMotivo(motivo);
        return bloqueoRepository.save(bloqueo).getId();
    }

    @Transactional
    public void eliminarBloqueo(UUID bloqueoId) {
        if (!bloqueoRepository.existsById(bloqueoId)) {
            throw new ResourceNotFoundException("Bloqueo no encontrado");
        }
        bloqueoRepository.deleteById(bloqueoId);
    }
}
