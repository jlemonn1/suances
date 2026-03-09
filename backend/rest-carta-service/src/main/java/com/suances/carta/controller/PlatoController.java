package com.suances.carta.controller;

import com.suances.carta.dto.request.PlatoRequest;
import com.suances.carta.dto.request.PlatoImagenRequest;
import com.suances.carta.dto.response.PlatoResponse;
import com.suances.carta.event.SseEmitterManager;
import com.suances.carta.service.PlatoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/platos")
public class PlatoController {

    private final PlatoService platoService;
    private final SseEmitterManager sseEmitterManager;

    public PlatoController(PlatoService platoService, SseEmitterManager sseEmitterManager) {
        this.platoService = platoService;
        this.sseEmitterManager = sseEmitterManager;
    }

    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> events() {
        return ResponseEntity.ok(sseEmitterManager.addEmitter());
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<PlatoResponse> crear(@Valid @RequestBody PlatoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(platoService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<PlatoResponse>> listar(
            @RequestParam(required = false, defaultValue = "true") Boolean activo) {
        return ResponseEntity.ok(platoService.listar(activo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlatoResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(platoService.obtener(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<PlatoResponse> actualizar(
            @PathVariable UUID id, 
            @Valid @RequestBody PlatoRequest request) {
        return ResponseEntity.ok(platoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> desactivar(@PathVariable UUID id) {
        platoService.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> activar(@PathVariable UUID id) {
        platoService.activar(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/imagenes")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<PlatoResponse> agregarImagen(
            @PathVariable UUID id,
            @Valid @RequestBody PlatoImagenRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(platoService.agregarImagen(id, request));
    }

    @GetMapping("/{id}/imagenes")
    public ResponseEntity<List<PlatoResponse.ImagenResponse>> listarImagenes(@PathVariable UUID id) {
        return ResponseEntity.ok(platoService.listarImagenes(id));
    }

    @DeleteMapping("/{id}/imagenes/{imgId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> eliminarImagen(
            @PathVariable UUID id,
            @PathVariable UUID imgId) {
        platoService.eliminarImagen(id, imgId);
        return ResponseEntity.noContent().build();
    }
}
