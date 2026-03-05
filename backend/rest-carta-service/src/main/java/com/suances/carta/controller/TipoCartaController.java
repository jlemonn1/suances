package com.suances.carta.controller;

import com.suances.carta.dto.request.AsociarPlatosRequest;
import com.suances.carta.dto.request.TipoCartaRequest;
import com.suances.carta.dto.response.TipoCartaResponse;
import com.suances.carta.service.TipoCartaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tipos-carta")
public class TipoCartaController {

    private final TipoCartaService tipoCartaService;

    public TipoCartaController(TipoCartaService tipoCartaService) {
        this.tipoCartaService = tipoCartaService;
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<TipoCartaResponse> crear(@Valid @RequestBody TipoCartaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tipoCartaService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<TipoCartaResponse>> listar() {
        return ResponseEntity.ok(tipoCartaService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoCartaResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(tipoCartaService.obtener(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<TipoCartaResponse> actualizar(
            @PathVariable UUID id, 
            @Valid @RequestBody TipoCartaRequest request) {
        return ResponseEntity.ok(tipoCartaService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> desactivar(@PathVariable UUID id) {
        tipoCartaService.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/platos")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<TipoCartaResponse> asociarPlatos(
            @PathVariable UUID id,
            @RequestBody AsociarPlatosRequest request) {
        return ResponseEntity.ok(tipoCartaService.asociarPlatos(id, request.getPlatoIds()));
    }

    @GetMapping("/carta/activa")
    public ResponseEntity<TipoCartaResponse> obtenerCartaActiva() {
        return ResponseEntity.ok(tipoCartaService.obtenerCartaActiva());
    }
}
