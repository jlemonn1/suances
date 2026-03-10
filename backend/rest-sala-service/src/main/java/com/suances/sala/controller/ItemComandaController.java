package com.suances.sala.controller;

import com.suances.sala.domain.dto.request.EnviarCocinaRequest;
import com.suances.sala.domain.dto.request.ItemComandaRequest;
import com.suances.sala.domain.dto.response.ItemComandaResponse;
import com.suances.sala.domain.model.enums.TipoRonda;
import com.suances.sala.service.ItemComandaService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/comandas/{comandaId}/items")
public class ItemComandaController {

    private static final Logger log = LoggerFactory.getLogger(ItemComandaController.class);

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
        log.info("=== ENDPOINT POST /comandas/{}/items ===", comandaId);
        log.info("Items recibidos: {}", requests.size());
        requests.forEach(r -> log.info("  - Plato: {} (ID: {}), Cantidad: {}, TipoRonda: {}, NumeroRonda: {}", 
                r.nombrePlato(), r.platoId(), r.cantidad(), r.tipoRonda(), r.numeroRonda()));
        List<ItemComandaResponse> response = itemComandaService.agregarItems(comandaId, requests);
        log.info("=== ENDPOINT items respondiendo: {} items creados ===", response.size());
        return response;
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

    @PostMapping("/enviar-cocina")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<Void> enviarACocina(
            @PathVariable UUID comandaId,
            @Valid @RequestBody EnviarCocinaRequest request) {
        itemComandaService.enviarItemsACocina(comandaId, request.itemIds());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/crear-y-enviar")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public List<ItemComandaResponse> crearYEnviarACocina(
            @PathVariable UUID comandaId,
            @Valid @RequestBody List<ItemComandaRequest> requests) {
        log.info("=== ENDPOINT POST /comandas/{}/items/crear-y-enviar ===", comandaId);
        log.info("Items recibidos para crear y enviar: {}", requests.size());
        requests.forEach(r -> log.info("  - Plato: {} (ID: {}), Cantidad: {}, TipoRonda: {}, NumeroRonda: {}", 
                r.nombrePlato(), r.platoId(), r.cantidad(), r.tipoRonda(), r.numeroRonda()));
        List<ItemComandaResponse> response = itemComandaService.crearYEnviarItemsACocina(comandaId, requests);
        log.info("=== ENDPOINT crear-y-enviar respondiendo: {} items creados y enviados ===", response.size());
        return response;
    }
}
