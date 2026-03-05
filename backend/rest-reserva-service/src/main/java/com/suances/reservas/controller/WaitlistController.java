package com.suances.reservas.controller;

import com.suances.reservas.domain.model.enums.WaitlistEstado;
import com.suances.reservas.dto.WaitlistResponse;
import com.suances.reservas.service.WaitlistService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/waitlist")
@PreAuthorize("hasAnyRole('OWNER','MANAGER')")
public class WaitlistController {

    private final WaitlistService waitlistService;

    public WaitlistController(WaitlistService waitlistService) {
        this.waitlistService = waitlistService;
    }

    @GetMapping
    public List<WaitlistResponse> listar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam UUID franjaId) {
        return waitlistService.listar(fecha, franjaId);
    }

    @PostMapping("/{entryId}/estado")
    public WaitlistResponse actualizarEstado(
            @PathVariable UUID entryId,
            @RequestParam WaitlistEstado estado) {
        return waitlistService.actualizarEstado(entryId, estado);
    }
}
