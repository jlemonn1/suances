package com.suances.reservas.service;

import com.suances.reservas.domain.model.FranjaHoraria;
import com.suances.reservas.dto.FranjaRequest;
import com.suances.reservas.dto.FranjaResponse;
import com.suances.reservas.exception.ResourceNotFoundException;
import com.suances.reservas.repository.FranjaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class FranjaService {

    private final FranjaRepository franjaRepository;

    public FranjaService(FranjaRepository franjaRepository) {
        this.franjaRepository = franjaRepository;
    }

    @Transactional
    public FranjaResponse create(FranjaRequest request) {
        FranjaHoraria franja = new FranjaHoraria();
        applyChanges(franja, request);
        return map(franjaRepository.save(franja));
    }

    @Transactional(readOnly = true)
    public List<FranjaResponse> list() {
        return franjaRepository.findAll().stream().map(this::map).toList();
    }

    @Transactional
    public FranjaResponse update(UUID id, FranjaRequest request) {
        FranjaHoraria franja = franjaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Franja no encontrada"));
        applyChanges(franja, request);
        return map(franja);
    }

    @Transactional
    public void delete(UUID id) {
        FranjaHoraria franja = franjaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Franja no encontrada"));
        franja.setActiva(false);
    }

    private void applyChanges(FranjaHoraria franja, FranjaRequest request) {
        franja.setNombre(request.nombre());
        franja.setTipo(request.tipo());
        franja.setHoraInicio(request.horaInicio());
        franja.setHoraFin(request.horaFin());
        if (request.activa() != null) {
            franja.setActiva(request.activa());
        }
    }

    private FranjaResponse map(FranjaHoraria franja) {
        return new FranjaResponse(
                franja.getId(),
                franja.getNombre(),
                franja.getTipo(),
                franja.getHoraInicio(),
                franja.getHoraFin(),
                franja.isActiva());
    }
}
