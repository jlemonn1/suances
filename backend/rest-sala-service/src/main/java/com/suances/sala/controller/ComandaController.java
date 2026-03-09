package com.suances.sala.controller;

import com.suances.sala.domain.dto.request.ComandaRequest;
import com.suances.sala.domain.dto.response.ComandaResponse;
import com.suances.sala.domain.model.enums.ComandaEstado;
import com.suances.sala.service.ComandaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/comandas")
public class ComandaController {

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

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ComandaResponse obtener(@PathVariable UUID id) {
        return comandaService.obtenerComanda(id);
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ComandaResponse cambiarEstado(@PathVariable UUID id, @RequestParam ComandaEstado estado) {
        return comandaService.cambiarEstado(id, estado);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<Void> cancelar(@PathVariable UUID id, @RequestParam String motivo) {
        comandaService.cancelarComanda(id, motivo);
        return ResponseEntity.noContent().build();
    }
}
