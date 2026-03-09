package com.suances.reservas.controller;

import com.suances.reservas.dto.FranjaRequest;
import com.suances.reservas.dto.FranjaResponse;
import com.suances.reservas.service.FranjaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/franjas")
public class FranjaController {

    private final FranjaService franjaService;

    public FranjaController(FranjaService franjaService) {
        this.franjaService = franjaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('OWNER')")
    public FranjaResponse crear(@Valid @RequestBody FranjaRequest request) {
        return franjaService.create(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','SERVICE')")
    public List<FranjaResponse> listar() {
        return franjaService.list();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public FranjaResponse actualizar(@PathVariable UUID id, @Valid @RequestBody FranjaRequest request) {
        return franjaService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('OWNER')")
    public void eliminar(@PathVariable UUID id) {
        franjaService.delete(id);
    }
}
