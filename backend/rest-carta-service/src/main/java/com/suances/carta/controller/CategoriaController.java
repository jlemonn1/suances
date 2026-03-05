package com.suances.carta.controller;

import com.suances.carta.domain.enums.CategoriaTipo;
import com.suances.carta.dto.request.CategoriaRequest;
import com.suances.carta.dto.response.CategoriaResponse;
import com.suances.carta.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<CategoriaResponse> crear(@Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<CategoriaResponse>> listar(
            @RequestParam(required = false, defaultValue = "true") Boolean activo,
            @RequestParam(required = false) CategoriaTipo tipo) {
        return ResponseEntity.ok(categoriaService.listar(activo, tipo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(categoriaService.obtener(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<CategoriaResponse> actualizar(
            @PathVariable UUID id, 
            @Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.ok(categoriaService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> desactivar(@PathVariable UUID id) {
        categoriaService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
