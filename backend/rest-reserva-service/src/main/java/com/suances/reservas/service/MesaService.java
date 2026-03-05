package com.suances.reservas.service;

import com.suances.reservas.domain.model.Mesa;
import com.suances.reservas.domain.model.Sala;
import com.suances.reservas.dto.MesaRequest;
import com.suances.reservas.dto.MesaResponse;
import com.suances.reservas.exception.BusinessRuleException;
import com.suances.reservas.exception.ResourceNotFoundException;
import com.suances.reservas.repository.MesaRepository;
import com.suances.reservas.repository.SalaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class MesaService {

    private final MesaRepository mesaRepository;
    private final SalaRepository salaRepository;

    public MesaService(MesaRepository mesaRepository, SalaRepository salaRepository) {
        this.mesaRepository = mesaRepository;
        this.salaRepository = salaRepository;
    }

    @Transactional
    public MesaResponse create(UUID salaId, MesaRequest request) {
        Sala sala = getSala(salaId);
        mesaRepository.findBySalaAndNumero(sala, request.numero()).ifPresent(m -> {
            throw new BusinessRuleException("El número de mesa ya existe en la sala");
        });

        Mesa mesa = new Mesa();
        mesa.setSala(sala);
        applyChanges(mesa, request);
        return map(mesaRepository.save(mesa));
    }

    @Transactional(readOnly = true)
    public List<MesaResponse> listBySala(UUID salaId) {
        Sala sala = getSala(salaId);
        return mesaRepository.findBySalaAndActivaTrue(sala).stream().map(this::map).toList();
    }

    @Transactional
    public MesaResponse update(UUID mesaId, MesaRequest request) {
        Mesa mesa = mesaRepository.findById(mesaId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada"));
        applyChanges(mesa, request);
        return map(mesa);
    }

    private void applyChanges(Mesa mesa, MesaRequest request) {
        mesa.setNumero(request.numero());
        mesa.setCapacidad(request.capacidad().shortValue());
        mesa.setPosX(request.posX());
        mesa.setPosY(request.posY());
        mesa.setAncho(request.ancho());
        mesa.setAlto(request.alto());
        if (request.visibleOnline() != null) {
            mesa.setVisibleOnline(request.visibleOnline());
        }
        if (request.activa() != null) {
            mesa.setActiva(request.activa());
        }
    }

    private Sala getSala(UUID salaId) {
        return salaRepository.findById(salaId)
                .orElseThrow(() -> new ResourceNotFoundException("Sala no encontrada"));
    }

    private MesaResponse map(Mesa mesa) {
        return new MesaResponse(
                mesa.getId(),
                mesa.getSala().getId(),
                mesa.getNumero(),
                mesa.getCapacidad(),
                mesa.getPosX(),
                mesa.getPosY(),
                mesa.getAncho(),
                mesa.getAlto(),
                mesa.isVisibleOnline(),
                mesa.getEstado(),
                mesa.isActiva());
    }
}
