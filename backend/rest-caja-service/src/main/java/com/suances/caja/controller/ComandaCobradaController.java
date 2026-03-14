package com.suances.caja.controller;

import com.suances.caja.domain.dto.response.ComandaCobradaDetalle;
import com.suances.caja.domain.dto.response.ComandaCobradaResumen;
import com.suances.caja.domain.enums.MetodoPago;
import com.suances.caja.service.ComandaCobradaQueryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/comandas")
public class ComandaCobradaController {

    private final ComandaCobradaQueryService queryService;

    public ComandaCobradaController(ComandaCobradaQueryService queryService) {
        this.queryService = queryService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<Page<ComandaCobradaResumen>> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @RequestParam(required = false) MetodoPago metodoPago,
            @RequestParam(required = false) UUID sesionCajaId,
            @RequestParam(required = false) String mesaNumero,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(queryService.listar(
                fecha, fechaDesde, fechaHasta, metodoPago, sesionCajaId, mesaNumero, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ComandaCobradaDetalle> detalle(@PathVariable UUID id) {
        return ResponseEntity.ok(queryService.detalle(id));
    }
}
