package com.suances.personnel.controller;

import com.suances.personnel.dto.request.ChangeRoleRequest;
import com.suances.personnel.dto.request.CreateAnotacionRequest;
import com.suances.personnel.dto.request.CreatePersonnelRequest;
import com.suances.personnel.dto.request.ToggleModoEspiaRequest;
import com.suances.personnel.dto.request.UpdatePersonnelRequest;
import com.suances.personnel.dto.response.AnotacionPersonalResponse;
import com.suances.personnel.dto.response.PersonnelResponse;
import com.suances.personnel.dto.response.RoleChangeResponse;
import com.suances.personnel.service.AnotacionPersonalService;
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
    private final AnotacionPersonalService anotacionService;

    public PersonnelController(PersonnelService personnelService,
                               AnotacionPersonalService anotacionService) {
        this.personnelService = personnelService;
        this.anotacionService = anotacionService;
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<PersonnelResponse> crear(@Valid @RequestBody CreatePersonnelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(personnelService.crear(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<List<PersonnelResponse>> listar() {
        return ResponseEntity.ok(personnelService.listar());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OWNER') or #id == authentication.principal")
    public ResponseEntity<PersonnelResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(personnelService.obtener(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER') or #id == authentication.principal")
    public ResponseEntity<PersonnelResponse> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePersonnelRequest request) {
        return ResponseEntity.ok(personnelService.actualizar(id, request));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<RoleChangeResponse> cambiarRol(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeRoleRequest request) {
        return ResponseEntity.ok(personnelService.cambiarRol(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> desactivar(@PathVariable UUID id) {
        personnelService.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/modo-espia")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<PersonnelResponse> toggleModoEspia(
            @PathVariable UUID id,
            @Valid @RequestBody ToggleModoEspiaRequest request) {
        return ResponseEntity.ok(personnelService.toggleModoEspia(id, request.getActivo()));
    }

    @PostMapping("/anotaciones")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WAITER')")
    public ResponseEntity<AnotacionPersonalResponse> crearAnotacion(
            @Valid @RequestBody CreateAnotacionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(anotacionService.crear(request));
    }

    @GetMapping("/{id}/anotaciones")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<AnotacionPersonalResponse>> listarAnotacionesPorUsuario(
            @PathVariable UUID id) {
        return ResponseEntity.ok(anotacionService.listarPorUsuario(id));
    }

    @GetMapping("/anotaciones")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<AnotacionPersonalResponse>> listarTodasAnotaciones() {
        return ResponseEntity.ok(anotacionService.listarTodas());
    }
}
