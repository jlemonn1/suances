package com.suances.reservas.service;

import com.suances.reservas.domain.model.Sala;
import com.suances.reservas.dto.SalaRequest;
import com.suances.reservas.dto.SalaResponse;
import com.suances.reservas.exception.ResourceNotFoundException;
import com.suances.reservas.repository.SalaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SalaService {

    private final SalaRepository salaRepository;

    public SalaService(SalaRepository salaRepository) {
        this.salaRepository = salaRepository;
    }

    @Transactional
    public SalaResponse create(SalaRequest request) {
        Sala sala = new Sala();
        sala.setNombre(request.nombre());
        sala.setCapacidadMaxima(request.capacidadMaxima());
        sala.setLayoutJson(request.layoutJson());
        if (request.activa() != null) {
            sala.setActiva(request.activa());
        }
        Sala saved = salaRepository.save(sala);
        return map(saved);
    }

    @Transactional(readOnly = true)
    public List<SalaResponse> list() {
        return salaRepository.findAll().stream().map(this::map).toList();
    }

    @Transactional
    public SalaResponse update(UUID id, SalaRequest request) {
        Sala sala = salaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sala no encontrada"));
        sala.setNombre(request.nombre());
        sala.setCapacidadMaxima(request.capacidadMaxima());
        sala.setLayoutJson(request.layoutJson());
        if (request.activa() != null) {
            sala.setActiva(request.activa());
        }
        return map(sala);
    }

    @Transactional
    public void deactivate(UUID id) {
        Sala sala = salaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sala no encontrada"));
        sala.setActiva(false);
    }

    private SalaResponse map(Sala sala) {
        return new SalaResponse(sala.getId(), sala.getNombre(), sala.getCapacidadMaxima(), sala.getLayoutJson(), sala.isActiva());
    }
}
