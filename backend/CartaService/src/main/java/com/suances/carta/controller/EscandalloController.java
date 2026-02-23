package com.suances.carta.controller;

import com.suances.carta.dto.request.EscandalloRequest;
import com.suances.carta.dto.response.EscandalloResponse;
import com.suances.carta.service.EscandalloService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/platos")
public class EscandalloController {

    private final EscandalloService escandalloService;

    public EscandalloController(EscandalloService escandalloService) {
        this.escandalloService = escandalloService;
    }

    @PostMapping("/{platoId}/escandallo")
    @PreAuthorize("hasRole('PROPIETARIO')")
    public ResponseEntity<EscandalloResponse> crearOActualizar(
            @PathVariable UUID platoId,
            @Valid @RequestBody EscandalloRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(escandalloService.crearOActualizar(platoId, request));
    }

    @GetMapping("/{platoId}/escandallo")
    public ResponseEntity<EscandalloResponse> obtener(@PathVariable UUID platoId) {
        return ResponseEntity.ok(escandalloService.obtener(platoId));
    }

    @DeleteMapping("/{platoId}/escandallo")
    @PreAuthorize("hasRole('PROPIETARIO')")
    public ResponseEntity<Void> eliminar(@PathVariable UUID platoId) {
        escandalloService.eliminar(platoId);
        return ResponseEntity.noContent().build();
    }
}
