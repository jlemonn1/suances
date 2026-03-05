package com.suances.reservas.controller;

import com.suances.reservas.domain.model.enums.BloqueoTipo;
import com.suances.reservas.service.BloqueoService;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/mesas")
@PreAuthorize("hasAnyRole('OWNER','MANAGER')")
public class BloqueoController {

    private final BloqueoService bloqueoService;

    public BloqueoController(BloqueoService bloqueoService) {
        this.bloqueoService = bloqueoService;
    }

    @PostMapping("/{mesaId}/bloqueos")
    @ResponseStatus(HttpStatus.CREATED)
    public UUID crear(
            @PathVariable UUID mesaId,
            @RequestParam BloqueoTipo tipo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @RequestParam(required = false) String motivo) {
        return bloqueoService.crearBloqueo(mesaId, tipo, fechaDesde, fechaHasta, motivo);
    }

    @DeleteMapping("/{mesaId}/bloqueos/{bloqueoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable UUID mesaId, @PathVariable UUID bloqueoId) {
        bloqueoService.eliminarBloqueo(bloqueoId);
    }
}
