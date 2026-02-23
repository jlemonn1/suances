package com.suances.carta.service;

import com.suances.carta.domain.model.Plato;
import com.suances.carta.domain.model.TipoCarta;
import com.suances.carta.dto.request.TipoCartaRequest;
import com.suances.carta.dto.response.TipoCartaResponse;
import com.suances.carta.exception.BusinessRuleException;
import com.suances.carta.exception.ResourceNotFoundException;
import com.suances.carta.repository.PlatoRepository;
import com.suances.carta.repository.TipoCartaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TipoCartaService {

    private final TipoCartaRepository tipoCartaRepository;
    private final PlatoRepository platoRepository;

    public TipoCartaService(TipoCartaRepository tipoCartaRepository, PlatoRepository platoRepository) {
        this.tipoCartaRepository = tipoCartaRepository;
        this.platoRepository = platoRepository;
    }

    @Transactional
    public TipoCartaResponse crear(TipoCartaRequest request) {
        validarNoSolapamiento(null, request.getHoraInicio(), request.getHoraFin());
        
        TipoCarta tipoCarta = new TipoCarta();
        tipoCarta.setNombre(request.getNombre());
        tipoCarta.setHoraInicio(request.getHoraInicio());
        tipoCarta.setHoraFin(request.getHoraFin());
        tipoCarta.setActivo(true);

        TipoCarta saved = tipoCartaRepository.save(tipoCarta);
        return TipoCartaResponse.fromEntity(saved);
    }

    public List<TipoCartaResponse> listar() {
        return tipoCartaRepository.findAll().stream()
                .map(TipoCartaResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public TipoCartaResponse obtener(UUID id) {
        TipoCarta tipoCarta = tipoCartaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de carta no encontrado: " + id));
        return TipoCartaResponse.fromEntity(tipoCarta);
    }

    @Transactional
    public TipoCartaResponse actualizar(UUID id, TipoCartaRequest request) {
        TipoCarta tipoCarta = tipoCartaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de carta no encontrado: " + id));

        validarNoSolapamiento(id, request.getHoraInicio(), request.getHoraFin());

        tipoCarta.setNombre(request.getNombre());
        tipoCarta.setHoraInicio(request.getHoraInicio());
        tipoCarta.setHoraFin(request.getHoraFin());

        TipoCarta saved = tipoCartaRepository.save(tipoCarta);
        return TipoCartaResponse.fromEntity(saved);
    }

    @Transactional
    public void desactivar(UUID id) {
        TipoCarta tipoCarta = tipoCartaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de carta no encontrado: " + id));
        tipoCarta.setActivo(false);
        tipoCartaRepository.save(tipoCarta);
    }

    @Transactional
    public TipoCartaResponse asociarPlatos(UUID tipoCartaId, List<UUID> platoIds) {
        TipoCarta tipoCarta = tipoCartaRepository.findById(tipoCartaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de carta no encontrado: " + tipoCartaId));

        List<Plato> platos = platoRepository.findAllById(platoIds);
        if (platos.size() != platoIds.size()) {
            throw new ResourceNotFoundException("Uno o más platos no encontrados");
        }

        tipoCarta.getPlatos().clear();
        tipoCarta.getPlatos().addAll(platos);

        TipoCarta saved = tipoCartaRepository.save(tipoCarta);
        return TipoCartaResponse.fromEntity(saved);
    }

    public TipoCartaResponse obtenerCartaActiva() {
        LocalTime horaActual = LocalTime.now();
        TipoCarta tipoCarta = tipoCartaRepository.findActivaByHoraActual(horaActual)
                .orElseThrow(() -> new ResourceNotFoundException("No hay carta activa en este horario"));

        tipoCarta.getPlatos().removeIf(plato -> !plato.getActivo());

        return TipoCartaResponse.fromEntity(tipoCarta);
    }

    private void validarNoSolapamiento(UUID id, LocalTime horaInicio, LocalTime horaFin) {
        if (horaInicio.compareTo(horaFin) >= 0) {
            throw new BusinessRuleException("La hora de inicio debe ser menor que la hora de fin");
        }

        List<TipoCarta> solapados = tipoCartaRepository.findActivasSolapadasExcluyendoId(
                id, horaInicio, horaFin);

        if (!solapados.isEmpty()) {
            throw new BusinessRuleException("Ya existe un tipo de carta activo en ese horario");
        }
    }
}
