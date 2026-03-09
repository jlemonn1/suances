package com.suances.sala.controller;

import com.suances.sala.domain.dto.response.TicketCocinaResponse;
import com.suances.sala.domain.model.enums.TipoRonda;
import com.suances.sala.service.CocinaService;
import com.suances.sala.service.ItemComandaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/cocina")
public class CocinaController {

    private final CocinaService cocinaService;
    private final ItemComandaService itemComandaService;

    public CocinaController(CocinaService cocinaService, ItemComandaService itemComandaService) {
        this.cocinaService = cocinaService;
        this.itemComandaService = itemComandaService;
    }

    @GetMapping("/pendientes")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public List<TicketCocinaResponse> obtenerComandasEnPreparacion() {
        return cocinaService.obtenerComandasEnPreparacion();
    }

    @GetMapping("/comandas/{comandaId}")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public TicketCocinaResponse obtenerTicketParaCocina(@PathVariable UUID comandaId) {
        return cocinaService.obtenerTicketParaCocina(comandaId);
    }

    @PatchMapping("/comandas/{comandaId}/ronda-lista")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<Void> marcarRondaLista(
            @PathVariable UUID comandaId,
            @RequestParam TipoRonda ronda) {
        itemComandaService.marcarRondaLista(comandaId, ronda);
        return ResponseEntity.ok().build();
    }
}
