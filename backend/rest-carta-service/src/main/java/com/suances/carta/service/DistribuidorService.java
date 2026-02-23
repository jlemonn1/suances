package com.suances.carta.service;

import com.suances.carta.domain.model.Distribuidor;
import com.suances.carta.dto.request.DistribuidorRequest;
import com.suances.carta.dto.response.DistribuidorResponse;
import com.suances.carta.exception.BusinessRuleException;
import com.suances.carta.exception.ResourceNotFoundException;
import com.suances.carta.repository.DistribuidorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DistribuidorService {

    private final DistribuidorRepository distribuidorRepository;

    public DistribuidorService(DistribuidorRepository distribuidorRepository) {
        this.distribuidorRepository = distribuidorRepository;
    }

    @Transactional
    public DistribuidorResponse crear(DistribuidorRequest request) {
        validarContactoObligatorio(request.getEmail(), request.getTelefono());

        Distribuidor distribuidor = new Distribuidor();
        distribuidor.setNombre(request.getNombre());
        distribuidor.setEmail(request.getEmail());
        distribuidor.setTelefono(request.getTelefono());
        distribuidor.setDescripcion(request.getDescripcion());
        distribuidor.setActivo(true);

        Distribuidor saved = distribuidorRepository.save(distribuidor);
        return DistribuidorResponse.fromEntity(saved);
    }

    public List<DistribuidorResponse> listar(Boolean activo) {
        List<Distribuidor> distribuidores;
        if (Boolean.TRUE.equals(activo)) {
            distribuidores = distribuidorRepository.findByActivoTrue();
        } else {
            distribuidores = distribuidorRepository.findAll();
        }
        return distribuidores.stream()
                .map(DistribuidorResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public DistribuidorResponse obtener(UUID id) {
        Distribuidor distribuidor = distribuidorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Distribuidor no encontrado: " + id));
        return DistribuidorResponse.fromEntity(distribuidor);
    }

    @Transactional
    public DistribuidorResponse actualizar(UUID id, DistribuidorRequest request) {
        Distribuidor distribuidor = distribuidorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Distribuidor no encontrado: " + id));

        validarContactoObligatorio(request.getEmail(), request.getTelefono());

        distribuidor.setNombre(request.getNombre());
        distribuidor.setEmail(request.getEmail());
        distribuidor.setTelefono(request.getTelefono());
        distribuidor.setDescripcion(request.getDescripcion());

        Distribuidor saved = distribuidorRepository.save(distribuidor);
        return DistribuidorResponse.fromEntity(saved);
    }

    @Transactional
    public void desactivar(UUID id) {
        Distribuidor distribuidor = distribuidorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Distribuidor no encontrado: " + id));
        distribuidor.setActivo(false);
        distribuidorRepository.save(distribuidor);
    }

    private void validarContactoObligatorio(String email, String telefono) {
        if ((email == null || email.isBlank()) && (telefono == null || telefono.isBlank())) {
            throw new BusinessRuleException("Debe proporcionar al menos un medio de contacto: email o teléfono");
        }
    }
}
