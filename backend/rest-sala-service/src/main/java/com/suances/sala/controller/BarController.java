package com.suances.sala.controller;

import com.suances.sala.domain.dto.request.ItemComandaRequest;
import com.suances.sala.domain.dto.response.ItemComandaResponse;
import com.suances.sala.domain.model.enums.TipoRonda;
import com.suances.sala.service.BarService;
import com.suances.sala.service.ItemComandaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
public class BarController {

    private final BarService barService;
    private final ItemComandaService itemComandaService;

    public BarController(BarService barService, ItemComandaService itemComandaService) {
        this.barService = barService;
        this.itemComandaService = itemComandaService;
    }

    @PostMapping("/comandas/{comandaId}/bar/bebidas")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public List<ItemComandaResponse> agregarBebidas(
            @PathVariable UUID comandaId,
            @Valid @RequestBody List<ItemComandaRequest> requests) {
        // Asegurar que todas las bebidas tengan tipo BEBIDA
        List<ItemComandaRequest> bebidas = requests.stream()
                .map(r -> new ItemComandaRequest(
                        r.platoId(),
                        r.nombrePlato(),
                        TipoRonda.BEBIDA,
                        r.cantidad(),
                        r.notas(),
                        r.ordenEnRonda()
                ))
                .toList();
        
        return itemComandaService.agregarItems(comandaId, bebidas);
    }

    @GetMapping("/bar/pendientes")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public List<ItemComandaResponse> obtenerBebidasPendientes() {
        return barService.obtenerBebidasPendientes();
    }

    @PostMapping("/bar/bebidas/{itemId}/servida")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<Void> marcarBebidaServida(@PathVariable UUID itemId) {
        barService.marcarBebidaServida(itemId);
        return ResponseEntity.ok().build();
    }
}
