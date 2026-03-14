package com.suances.carta.service;

import com.suances.carta.domain.model.Categoria;
import com.suances.carta.domain.model.Plato;
import com.suances.carta.domain.model.PlatoImagen;
import com.suances.carta.dto.event.PlatoChangedEvent;
import com.suances.carta.dto.event.PlatoDisponibilidadEvent;
import com.suances.carta.dto.request.PlatoRequest;
import com.suances.carta.dto.request.PlatoImagenRequest;
import com.suances.carta.dto.response.PlatoResponse;
import com.suances.carta.exception.ResourceNotFoundException;
import com.suances.carta.repository.CategoriaRepository;
import com.suances.carta.repository.PlatoRepository;
import com.suances.carta.repository.PlatoImagenRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlatoService {

    private final PlatoRepository platoRepository;
    private final PlatoImagenRepository platoImagenRepository;
    private final CategoriaRepository categoriaRepository;
    private final EventProducer eventProducer;

    @Transactional
    public PlatoResponse crear(PlatoRequest request) {
        Plato plato = new Plato();
        plato.setNombre(request.getNombre());
        plato.setDescripcion(request.getDescripcion());
        plato.setPrecioVenta(request.getPrecioVenta());
        plato.setContadorPedidos(0L);
        plato.setActivo(true);

        if (request.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Categoría no encontrada: " + request.getCategoriaId()));
            plato.setCategoria(categoria);
        }

        Plato saved = platoRepository.save(plato);

        // Publicar evento de plato creado (sin asociar a tipos de carta)
        PlatoChangedEvent event = new PlatoChangedEvent(
                "carta.plato.created",
                saved.getId(),
                saved.getNombre(),
                saved.getDescripcion(),
                saved.getPrecioVenta(),
                saved.getCategoria() != null ? saved.getCategoria().getId() : null,
                saved.getCategoria() != null ? saved.getCategoria().getNombre() : null,
                saved.getActivo());
        eventProducer.publicarPlatoCreado(event);

        return PlatoResponse.fromEntity(saved);
    }

    public List<PlatoResponse> listar(Boolean activo) {
        List<Plato> platos;
        if (Boolean.TRUE.equals(activo)) {
            platos = platoRepository.findByActivoTrue();
        } else {
            platos = platoRepository.findAll();
        }
        return platos.stream()
                .map(PlatoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public PlatoResponse obtener(UUID id) {
        Plato plato = platoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plato no encontrado: " + id));
        return PlatoResponse.fromEntity(plato);
    }

    @Transactional
    public PlatoResponse actualizar(UUID id, PlatoRequest request) {
        Plato plato = platoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plato no encontrado: " + id));

        plato.setNombre(request.getNombre());
        plato.setDescripcion(request.getDescripcion());
        plato.setPrecioVenta(request.getPrecioVenta());

        if (request.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Categoría no encontrada: " + request.getCategoriaId()));
            plato.setCategoria(categoria);
        } else {
            plato.setCategoria(null);
        }

        Plato saved = platoRepository.save(plato);

        // Publicar evento de plato actualizado
        PlatoChangedEvent event = new PlatoChangedEvent(
                "carta.plato.updated",
                saved.getId(),
                saved.getNombre(),
                saved.getDescripcion(),
                saved.getPrecioVenta(),
                saved.getCategoria() != null ? saved.getCategoria().getId() : null,
                saved.getCategoria() != null ? saved.getCategoria().getNombre() : null,
                saved.getActivo());
        eventProducer.publicarPlatoActualizado(event);

        return PlatoResponse.fromEntity(saved);
    }

    @Transactional
    public void desactivar(UUID id) {
        Plato plato = platoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plato no encontrado: " + id));
        plato.setActivo(false);
        Plato saved = platoRepository.save(plato);

        // Publicar evento de disponibilidad (plato no disponible)
        PlatoDisponibilidadEvent event = new PlatoDisponibilidadEvent(
                saved.getId(),
                saved.getNombre(),
                false);
        eventProducer.publicarPlatoDisponibilidad(event);
    }

    @Transactional
    public void activar(UUID id) {
        Plato plato = platoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plato no encontrado: " + id));
        plato.setActivo(true);
        Plato saved = platoRepository.save(plato);

        // Publicar evento de disponibilidad (plato disponible)
        PlatoDisponibilidadEvent event = new PlatoDisponibilidadEvent(
                saved.getId(),
                saved.getNombre(),
                true);
        eventProducer.publicarPlatoDisponibilidad(event);
    }

    @Transactional
    public void incrementarContador(UUID platoId, int cantidad) {
        Plato plato = platoRepository.findById(platoId)
                .orElseThrow(() -> new ResourceNotFoundException("Plato no encontrado: " + platoId));
        plato.setContadorPedidos(plato.getContadorPedidos() + cantidad);
        platoRepository.save(plato);
    }

    @Transactional
    public PlatoResponse agregarImagen(UUID platoId, PlatoImagenRequest request) {
        Plato plato = platoRepository.findById(platoId)
                .orElseThrow(() -> new ResourceNotFoundException("Plato no encontrado: " + platoId));

        PlatoImagen imagen = new PlatoImagen();
        imagen.setPlato(plato);
        imagen.setUrl(request.getUrl());
        imagen.setOrden(request.getOrden());

        platoImagenRepository.save(imagen);
        return PlatoResponse.fromEntity(plato);
    }

    public List<PlatoResponse.ImagenResponse> listarImagenes(UUID platoId) {
        if (!platoRepository.existsById(platoId)) {
            throw new ResourceNotFoundException("Plato no encontrado: " + platoId);
        }
        return platoImagenRepository.findByPlatoIdOrderByOrdenAsc(platoId).stream()
                .map(PlatoResponse.ImagenResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void eliminarImagen(UUID platoId, UUID imagenId) {
        if (!platoRepository.existsById(platoId)) {
            throw new ResourceNotFoundException("Plato no encontrado: " + platoId);
        }
        PlatoImagen imagen = platoImagenRepository.findById(imagenId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagen no encontrada: " + imagenId));

        if (!imagen.getPlato().getId().equals(platoId)) {
            throw new ResourceNotFoundException("La imagen no pertenece al plato especificado");
        }

        platoImagenRepository.delete(imagen);
    }
}
