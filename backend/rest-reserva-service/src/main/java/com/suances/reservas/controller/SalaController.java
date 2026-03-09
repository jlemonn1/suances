package com.suances.reservas.controller;

import com.suances.reservas.dto.SalaRequest;
import com.suances.reservas.dto.SalaResponse;
import com.suances.reservas.service.SalaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/salas")
public class SalaController {

    private final SalaService salaService;

    public SalaController(SalaService salaService) {
        this.salaService = salaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('OWNER')")
    public SalaResponse crear(@Valid @RequestBody SalaRequest request) {
        return salaService.create(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','SERVICE')")
    public List<SalaResponse> listar() {
        return salaService.list();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public SalaResponse actualizar(@PathVariable UUID id, @Valid @RequestBody SalaRequest request) {
        return salaService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('OWNER')")
    public void eliminar(@PathVariable UUID id) {
        salaService.deactivate(id);
    }
}
