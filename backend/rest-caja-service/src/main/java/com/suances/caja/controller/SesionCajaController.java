package com.suances.caja.controller;

import com.suances.caja.domain.dto.request.AbrirCajaRequest;
import com.suances.caja.domain.dto.response.SesionCajaResponse;
import com.suances.caja.domain.enums.EstadoSesion;
import com.suances.caja.service.SesionCajaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/sesiones")
public class SesionCajaController {

    private final SesionCajaService sesionCajaService;

    public SesionCajaController(SesionCajaService sesionCajaService) {
        this.sesionCajaService = sesionCajaService;
    }

    @PostMapping("/abrir")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<SesionCajaResponse> abrir(
            @Valid @RequestBody AbrirCajaRequest request,
            JwtAuthenticationToken jwt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sesionCajaService.abrir(request, jwt));
    }

    @PostMapping("/cerrar")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<SesionCajaResponse> cerrar(JwtAuthenticationToken jwt) {
        return ResponseEntity.ok(sesionCajaService.cerrar(jwt));
    }

    @GetMapping("/activa")
    public ResponseEntity<SesionCajaResponse> sesionActiva() {
        return ResponseEntity.ok(sesionCajaService.sesionActiva());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<Page<SesionCajaResponse>> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @RequestParam(required = false) EstadoSesion estado,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(sesionCajaService.listar(fechaDesde, fechaHasta, estado, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<SesionCajaResponse> detalle(@PathVariable UUID id) {
        return ResponseEntity.ok(sesionCajaService.detalle(id));
    }
}
