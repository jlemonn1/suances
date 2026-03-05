package com.suances.carta.controller;

import com.suances.carta.dto.request.IngredienteRequest;
import com.suances.carta.dto.response.IngredienteResponse;
import com.suances.carta.service.IngredienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/ingredientes")
public class IngredienteController {

    private final IngredienteService ingredienteService;

    public IngredienteController(IngredienteService ingredienteService) {
        this.ingredienteService = ingredienteService;
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<IngredienteResponse> crear(@Valid @RequestBody IngredienteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ingredienteService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<IngredienteResponse>> listar(
            @RequestParam(required = false, defaultValue = "true") Boolean activo) {
        return ResponseEntity.ok(ingredienteService.listar(activo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IngredienteResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(ingredienteService.obtener(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<IngredienteResponse> actualizar(
            @PathVariable UUID id, 
            @Valid @RequestBody IngredienteRequest request) {
        return ResponseEntity.ok(ingredienteService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> desactivar(@PathVariable UUID id) {
        ingredienteService.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/distribuidores/{distribuidorId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> asociarDistribuidor(
            @PathVariable UUID id, 
            @PathVariable UUID distribuidorId) {
        ingredienteService.asociarDistribuidor(id, distribuidorId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}/distribuidores/{distribuidorId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> desasociarDistribuidor(
            @PathVariable UUID id, 
            @PathVariable UUID distribuidorId) {
        ingredienteService.desasociarDistribuidor(id, distribuidorId);
        return ResponseEntity.noContent().build();
    }
}
