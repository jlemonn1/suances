package com.suances.sala.controller;

import com.suances.sala.domain.model.Comanda;
import com.suances.sala.service.CuentaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/comandas/{comandaId}/cuenta")
public class CuentaController {

    private final CuentaService cuentaService;

    public CuentaController(CuentaService cuentaService) {
        this.cuentaService = cuentaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<BigDecimal> obtenerTotal(@PathVariable UUID comandaId) {
        BigDecimal total = cuentaService.calcularTotalComanda(comandaId);
        return ResponseEntity.ok(total);
    }

    @PostMapping("/cerrar")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<Comanda> cerrarCuenta(@PathVariable UUID comandaId) {
        Comanda comanda = cuentaService.cerrarCuenta(comandaId);
        return ResponseEntity.ok(comanda);
    }

    @PostMapping("/cobrar")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<Comanda> cobrarCuenta(
            @PathVariable UUID comandaId,
            @RequestParam String tipoPago,
            @RequestParam BigDecimal montoRecibido) {
        Comanda comanda = cuentaService.cobrarComanda(comandaId, tipoPago, montoRecibido);
        return ResponseEntity.ok(comanda);
    }

    @PostMapping("/descuento")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<Comanda> aplicarDescuento(
            @PathVariable UUID comandaId,
            @RequestParam BigDecimal porcentaje,
            @RequestParam String motivo) {
        Comanda comanda = cuentaService.aplicarDescuento(comandaId, porcentaje, motivo);
        return ResponseEntity.ok(comanda);
    }

    @GetMapping("/cambio")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<Map<String, BigDecimal>> calcularCambio(
            @PathVariable UUID comandaId,
            @RequestParam BigDecimal montoRecibido) {
        BigDecimal cambio = cuentaService.calcularCambio(comandaId, montoRecibido);
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("cambio", cambio);
        return ResponseEntity.ok(response);
    }
}
