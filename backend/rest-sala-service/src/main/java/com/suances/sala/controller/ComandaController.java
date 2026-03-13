package com.suances.sala.controller;

import com.suances.sala.domain.dto.request.ComandaRequest;
import com.suances.sala.domain.dto.response.ComandaDetalleRondasResponse;
import com.suances.sala.domain.dto.response.ComandaHoyResponse;
import com.suances.sala.domain.dto.response.ComandaResponse;
import com.suances.sala.domain.model.enums.ComandaEstado;
import com.suances.sala.service.ComandaService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/comandas")
public class ComandaController {

    private static final Logger log = LoggerFactory.getLogger(ComandaController.class);

    private final ComandaService comandaService;

    public ComandaController(ComandaService comandaService) {
        this.comandaService = comandaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ComandaResponse crear(@Valid @RequestBody ComandaRequest request) {
        return comandaService.crearComanda(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public Page<ComandaResponse> listar(Pageable pageable) {
        return comandaService.listarComandas(pageable);
    }

    @GetMapping("/estado/{estado}")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public Page<ComandaResponse> listarPorEstado(@PathVariable ComandaEstado estado, Pageable pageable) {
        return comandaService.listarComandasPorEstado(estado, pageable);
    }

    @GetMapping("/hoy")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<List<ComandaHoyResponse>> listarComandasHoy() {
        List<ComandaHoyResponse> comandas = comandaService.listarComandasHoy();
        return ResponseEntity.ok(comandas);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ComandaResponse obtener(@PathVariable UUID id) {
        return comandaService.obtenerComanda(id);
    }

    @GetMapping("/{id}/detalle-rondas")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ComandaDetalleRondasResponse obtenerConRondas(@PathVariable UUID id) {
        return comandaService.obtenerComandaConRondas(id);
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ComandaResponse cambiarEstado(@PathVariable UUID id, @RequestParam ComandaEstado estado) {
        return comandaService.cambiarEstado(id, estado);
    }

    @PostMapping("/{id}/nueva-ronda")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<Map<String, Integer>> crearNuevaRonda(@PathVariable UUID id) {
        log.info("=== ENDPOINT POST /comandas/{}/nueva-ronda ===", id);
        Integer numeroRonda = comandaService.crearNuevaRonda(id);
        log.info("=== ENDPOINT nueva-ronda respondiendo: numeroRonda={} ===", numeroRonda);
        return ResponseEntity.ok(Map.of("numeroRonda", numeroRonda));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<Void> cancelar(@PathVariable UUID id, @RequestParam String motivo) {
        comandaService.cancelarComanda(id, motivo);
        return ResponseEntity.noContent().build();
    }
}
