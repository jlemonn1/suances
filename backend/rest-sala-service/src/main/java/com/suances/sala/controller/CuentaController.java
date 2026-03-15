package com.suances.sala.controller;

import com.suances.sala.domain.dto.response.TicketCobroResponse;
import com.suances.sala.domain.model.Comanda;
import com.suances.sala.dto.request.CobrarCuentaRequest;
import com.suances.sala.service.CuentaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/comandas/{comandaId}/cuenta")
public class CuentaController {

    private static final Logger log = LoggerFactory.getLogger(CuentaController.class);

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
    public ResponseEntity<TicketCobroResponse> cerrarCuenta(
            @PathVariable UUID comandaId,
            @RequestBody(required = false) Map<String, String> request) {
        String impresora = request != null ? request.get("impresora") : null;
        TicketCobroResponse ticket = cuentaService.cerrarCuenta(comandaId, impresora);
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/cobrar")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<Comanda> cobrarCuenta(
            @PathVariable UUID comandaId,
            @RequestBody CobrarCuentaRequest request) {
        Comanda comanda = cuentaService.cobrarComanda(comandaId, request.getTipoPago(), request.getMontoRecibido());
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

    @PostMapping("/cancelar")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<TicketCobroResponse> cancelarCuentaCerrada(
            @PathVariable UUID comandaId,
            @RequestParam String motivo,
            @RequestParam String usuarioNombre) {
        TicketCobroResponse ticket = cuentaService.cancelarCuentaCerrada(comandaId, motivo, usuarioNombre);
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/modificar")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<TicketCobroResponse> modificarLineasCuentaCerrada(
            @PathVariable UUID comandaId,
            @RequestBody List<UUID> itemIds,
            @RequestParam String motivo) {
        TicketCobroResponse ticket = cuentaService.modificarLineasCuentaCerrada(comandaId, itemIds, motivo);
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/ticket/reenviar")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<Void> reenviarTicket(
            @PathVariable UUID comandaId,
            @RequestBody Map<String, String> request) {
        String impresora = request.get("impresora");
        if (impresora == null || impresora.isEmpty()) {
            throw new IllegalArgumentException("Debe especificar la impresora");
        }
        try {
            cuentaService.reenviarTicket(comandaId, impresora);
            log.info("[CuentaController] Ticket reenviado para comanda: {} a impresora: {}", comandaId, impresora);
        } catch (Exception e) {
            log.error("[CuentaController] Error al reenviar ticket: {}", e.getMessage());
            throw e;
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reimprimir")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<Void> reimprimirTicket(
            @PathVariable UUID comandaId,
            @RequestBody Map<String, String> request) {
        String impresora = request.get("impresora");
        log.info("[CuentaController] Reimprimir ticket para comanda: {} a impresora: {}", comandaId, impresora);
        try {
            cuentaService.reimprimirTicketSimple(comandaId, impresora);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("[CuentaController] Error al reimprimir: {}", e.getMessage());
            throw e;
        }
    }
}
