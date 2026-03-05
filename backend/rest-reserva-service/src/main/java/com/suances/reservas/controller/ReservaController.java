package com.suances.reservas.controller;

import com.suances.reservas.domain.model.enums.ReservaEstado;
import com.suances.reservas.dto.ReservaRequest;
import com.suances.reservas.dto.ReservaResponse;
import com.suances.reservas.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public List<ReservaResponse> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) ReservaEstado estado) {
        return reservaService.listar(fecha, estado);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ReservaResponse crearManual(@Valid @RequestBody ReservaRequest request) {
        return reservaService.crearReservaManual(request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ReservaResponse cancelar(@PathVariable UUID id, @RequestParam(required = false) String motivo) {
        return reservaService.cancelar(id, motivo);
    }
}
