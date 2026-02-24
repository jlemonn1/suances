package com.suances.personnel.controller;

import com.suances.personnel.dto.request.ChangeRoleRequest;
import com.suances.personnel.dto.request.CreatePersonnelRequest;
import com.suances.personnel.dto.request.UpdatePersonnelRequest;
import com.suances.personnel.dto.response.PersonnelResponse;
import com.suances.personnel.dto.response.RoleChangeResponse;
import com.suances.personnel.service.PersonnelService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/personnel")
public class PersonnelController {

    private final PersonnelService personnelService;

    public PersonnelController(PersonnelService personnelService) {
        this.personnelService = personnelService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PROPIETARIO')")
    public ResponseEntity<PersonnelResponse> crear(@Valid @RequestBody CreatePersonnelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(personnelService.crear(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PROPIETARIO', 'GERENTE')")
    public ResponseEntity<List<PersonnelResponse>> listar() {
        return ResponseEntity.ok(personnelService.listar());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PROPIETARIO') or #id == authentication.principal")
    public ResponseEntity<PersonnelResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(personnelService.obtener(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROPIETARIO') or #id == authentication.principal")
    public ResponseEntity<PersonnelResponse> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePersonnelRequest request) {
        return ResponseEntity.ok(personnelService.actualizar(id, request));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('PROPIETARIO')")
    public ResponseEntity<RoleChangeResponse> cambiarRol(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeRoleRequest request) {
        return ResponseEntity.ok(personnelService.cambiarRol(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROPIETARIO')")
    public ResponseEntity<Void> desactivar(@PathVariable UUID id) {
        personnelService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
