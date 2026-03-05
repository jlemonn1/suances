package com.suances.reservas.controller;

import com.suances.reservas.dto.MesaRequest;
import com.suances.reservas.dto.MesaResponse;
import com.suances.reservas.service.MesaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class MesaController {

    private final MesaService mesaService;

    public MesaController(MesaService mesaService) {
        this.mesaService = mesaService;
    }

    @PostMapping("/salas/{salaId}/mesas")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('OWNER')")
    public MesaResponse crear(@PathVariable UUID salaId, @Valid @RequestBody MesaRequest request) {
        return mesaService.create(salaId, request);
    }

    @GetMapping("/salas/{salaId}/mesas")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public List<MesaResponse> listar(@PathVariable UUID salaId) {
        return mesaService.listBySala(salaId);
    }

    @PatchMapping("/mesas/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public MesaResponse actualizar(@PathVariable UUID id, @Valid @RequestBody MesaRequest request) {
        return mesaService.update(id, request);
    }
}
