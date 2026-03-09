package com.suances.sala.controller;

import com.suances.sala.domain.dto.request.ItemComandaRequest;
import com.suances.sala.domain.dto.response.ItemComandaResponse;
import com.suances.sala.domain.model.enums.TipoRonda;
import com.suances.sala.service.ItemComandaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/comandas/{comandaId}/items")
public class ItemComandaController {

    private final ItemComandaService itemComandaService;

    public ItemComandaController(ItemComandaService itemComandaService) {
        this.itemComandaService = itemComandaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public List<ItemComandaResponse> agregarItems(
            @PathVariable UUID comandaId,
            @Valid @RequestBody List<ItemComandaRequest> requests) {
        return itemComandaService.agregarItems(comandaId, requests);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public List<ItemComandaResponse> listar(@PathVariable UUID comandaId) {
        return itemComandaService.listarItemsPorComanda(comandaId);
    }

    @GetMapping("/pendientes")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public List<ItemComandaResponse> listarPendientes(@PathVariable UUID comandaId) {
        return itemComandaService.listarItemsPendientes(comandaId);
    }

    @GetMapping("/ronda/{tipoRonda}")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public List<ItemComandaResponse> listarPorRonda(
            @PathVariable UUID comandaId,
            @PathVariable TipoRonda tipoRonda) {
        return itemComandaService.listarItemsPorRonda(comandaId, tipoRonda);
    }

    @PatchMapping("/{itemId}")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ItemComandaResponse modificar(
            @PathVariable UUID comandaId,
            @PathVariable UUID itemId,
            @Valid @RequestBody ItemComandaRequest request) {
        return itemComandaService.modificarItem(itemId, request);
    }

    @DeleteMapping("/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<Void> cancelar(
            @PathVariable UUID comandaId,
            @PathVariable UUID itemId,
            @RequestParam String motivo) {
        itemComandaService.cancelarItem(itemId, motivo);
        return ResponseEntity.noContent().build();
    }
}
