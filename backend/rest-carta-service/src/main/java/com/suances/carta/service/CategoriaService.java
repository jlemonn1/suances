package com.suances.carta.service;

import com.suances.carta.domain.enums.CategoriaTipo;
import com.suances.carta.domain.model.Categoria;
import com.suances.carta.dto.request.CategoriaRequest;
import com.suances.carta.dto.response.CategoriaResponse;
import com.suances.carta.exception.BusinessRuleException;
import com.suances.carta.exception.ResourceNotFoundException;
import com.suances.carta.repository.CategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional
    public CategoriaResponse crear(CategoriaRequest request) {
        CategoriaTipo tipo = request.getTipo() != null ? request.getTipo() : CategoriaTipo.INGREDIENTE;
        
        if (categoriaRepository.existsByNombreIgnoreCaseAndTipo(request.getNombre(), tipo)) {
            throw new BusinessRuleException("Ya existe una categoría con ese nombre y tipo");
        }
        
        Categoria categoria = new Categoria();
        categoria.setNombre(request.getNombre());
        categoria.setTipo(tipo);
        
        return CategoriaResponse.fromEntity(categoriaRepository.save(categoria));
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar(Boolean activo, CategoriaTipo tipo) {
        List<Categoria> categorias;
        
        if (tipo != null) {
            if (activo != null && activo) {
                categorias = categoriaRepository.findByActivoTrueAndTipo(tipo);
            } else {
                categorias = categoriaRepository.findAll().stream()
                    .filter(c -> c.getTipo() == tipo)
                    .collect(Collectors.toList());
            }
        } else {
            if (activo != null && activo) {
                categorias = categoriaRepository.findByActivoTrue();
            } else {
                categorias = categoriaRepository.findAll();
            }
        }
        
        return categorias.stream()
            .map(CategoriaResponse::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoriaResponse obtener(UUID id) {
        Categoria categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        return CategoriaResponse.fromEntity(categoria);
    }

    @Transactional
    public CategoriaResponse actualizar(UUID id, CategoriaRequest request) {
        Categoria categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        
        CategoriaTipo tipo = categoria.getTipo();
        
        if (categoriaRepository.existsByNombreIgnoreCaseAndTipoAndIdNot(request.getNombre(), tipo, id)) {
            throw new BusinessRuleException("Ya existe otra categoría con ese nombre");
        }
        
        categoria.setNombre(request.getNombre());
        
        return CategoriaResponse.fromEntity(categoriaRepository.save(categoria));
    }

    @Transactional
    public void desactivar(UUID id) {
        Categoria categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        
        categoria.setActivo(false);
        categoriaRepository.save(categoria);
    }
}
