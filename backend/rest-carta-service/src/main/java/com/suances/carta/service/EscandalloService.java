package com.suances.carta.service;

import com.suances.carta.domain.model.Escandallo;
import com.suances.carta.domain.model.EscandalloDetalle;
import com.suances.carta.domain.model.Ingrediente;
import com.suances.carta.domain.model.Plato;
import com.suances.carta.dto.event.EscandalloChangedEvent;
import com.suances.carta.dto.request.EscandalloRequest;
import com.suances.carta.dto.response.EscandalloResponse;
import com.suances.carta.exception.ResourceNotFoundException;
import com.suances.carta.repository.EscandalloRepository;
import com.suances.carta.repository.IngredienteRepository;
import com.suances.carta.repository.PlatoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.UUID;

@Service
public class EscandalloService {

    private final EscandalloRepository escandalloRepository;
    private final PlatoRepository platoRepository;
    private final IngredienteRepository ingredienteRepository;
    private final EventProducer eventProducer;

    public EscandalloService(EscandalloRepository escandalloRepository,
            PlatoRepository platoRepository,
            IngredienteRepository ingredienteRepository,
            EventProducer eventProducer) {
        this.escandalloRepository = escandalloRepository;
        this.platoRepository = platoRepository;
        this.ingredienteRepository = ingredienteRepository;
        this.eventProducer = eventProducer;
    }

    @Transactional
    public EscandalloResponse crearOActualizar(UUID platoId, EscandalloRequest request) {
        Plato plato = platoRepository.findById(platoId)
                .orElseThrow(() -> new ResourceNotFoundException("Plato no encontrado: " + platoId));

        Escandallo escandallo = escandalloRepository.findByPlatoId(platoId)
                .orElseGet(() -> {
                    Escandallo nuevo = new Escandallo();
                    nuevo.setPlato(plato);
                    return nuevo;
                });

        escandallo.setNombreVersion(request.getNombreVersion());

        escandallo.getDetalles().clear();

        BigDecimal costeTotal = BigDecimal.ZERO;

        for (EscandalloRequest.IngredienteCantidad ic : request.getIngredientes()) {
            Ingrediente ingrediente = ingredienteRepository.findById(ic.getIngredienteId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Ingrediente no encontrado: " + ic.getIngredienteId()));

            if (!ingrediente.getActivo()) {
                throw new IllegalArgumentException("El ingrediente no está activo: " + ingrediente.getNombre());
            }

            EscandalloDetalle detalle = new EscandalloDetalle();
            detalle.setEscandallo(escandallo);
            detalle.setIngrediente(ingrediente);
            detalle.setCantidad(ic.getCantidad());

            escandallo.getDetalles().add(detalle);

            BigDecimal coste = ic.getCantidad().multiply(ingrediente.getPrecioPorUnidad());
            costeTotal = costeTotal.add(coste);
        }

        escandallo.setCosteTotalSnapshot(costeTotal);

        boolean esNuevo = escandallo.getId() == null;
        Escandallo saved = escandalloRepository.save(escandallo);

        // Publicar evento de escandallo creado o actualizado
        EscandalloChangedEvent event = new EscandalloChangedEvent(
                esNuevo ? "carta.escandallo.created" : "carta.escandallo.updated",
                plato.getId(),
                plato.getNombre(),
                saved.getNombreVersion()
        );
        
        if (esNuevo) {
            eventProducer.publicarEscandalloCreado(event);
        } else {
            eventProducer.publicarEscandalloActualizado(event);
        }

        return EscandalloResponse.fromEntity(saved);
    }

    public EscandalloResponse obtener(UUID platoId) {
        Escandallo escandallo = escandalloRepository.findByPlatoId(platoId)
                .orElseThrow(() -> new ResourceNotFoundException("Escandallo no encontrado para el plato: " + platoId));
        return EscandalloResponse.fromEntity(escandallo);
    }

    @Transactional
    public void eliminar(UUID platoId) {
        Escandallo escandallo = escandalloRepository.findByPlatoId(platoId)
                .orElseThrow(() -> new ResourceNotFoundException("Escandallo no encontrado para el plato: " + platoId));
        
        Plato plato = escandallo.getPlato();
        String nombreVersion = escandallo.getNombreVersion();
        
        escandalloRepository.delete(escandallo);
        
        // Publicar evento de escandallo eliminado
        EscandalloChangedEvent event = new EscandalloChangedEvent(
                "carta.escandallo.deleted",
                platoId,
                plato != null ? plato.getNombre() : "Desconocido",
                nombreVersion
        );
        eventProducer.publicarEscandalloEliminado(event);
    }
}
