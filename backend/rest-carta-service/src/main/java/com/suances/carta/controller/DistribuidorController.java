package com.suances.carta.controller;

import com.suances.carta.dto.request.DistribuidorRequest;
import com.suances.carta.dto.response.DistribuidorResponse;
import com.suances.carta.service.DistribuidorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/distribuidores")
public class DistribuidorController {

    private final DistribuidorService distribuidorService;

    public DistribuidorController(DistribuidorService distribuidorService) {
        this.distribuidorService = distribuidorService;
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<DistribuidorResponse> crear(@Valid @RequestBody DistribuidorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(distribuidorService.crear(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<List<DistribuidorResponse>> listar(
            @RequestParam(required = false, defaultValue = "true") Boolean activo) {
        return ResponseEntity.ok(distribuidorService.listar(activo));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<DistribuidorResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(distribuidorService.obtener(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<DistribuidorResponse> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody DistribuidorRequest request) {
        return ResponseEntity.ok(distribuidorService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> desactivar(@PathVariable UUID id) {
        distribuidorService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
