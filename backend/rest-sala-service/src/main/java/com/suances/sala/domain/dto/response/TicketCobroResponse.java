package com.suances.sala.domain.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

// Ticket para cobro/corrección/cancelación - CON PRECIOS, ordenado por rondas
public record TicketCobroResponse(
        UUID comandaId,
        Integer mesaNumero,
        String codigo,
        String camareroNombre,
        Integer comensales,
        OffsetDateTime fechaApertura,
        List<RondaTicket> rondas,
        BigDecimal subtotal,
        BigDecimal descuento,
        BigDecimal total,
        // Campos para corrección/cancelación
        String tipoTicket,
        String motivo,
        String usuarioAccion,
        OffsetDateTime fechaAccion,
        BigDecimal totalAnterior,
        List<ItemTicket> itemsEliminados
) {
    public record RondaTicket(
            String tipoRonda,
            List<ItemTicket> items,
            BigDecimal subtotalRonda
    ) {}

    public record ItemTicket(
            String nombrePlato,
            Integer cantidad,
            BigDecimal precioUnitario,
            BigDecimal subtotal,
            String notas
    ) {}

    // Constructor para tickets normales (cobro)
    public TicketCobroResponse(
            UUID comandaId,
            Integer mesaNumero,
            String codigo,
            String camareroNombre,
            Integer comensales,
            OffsetDateTime fechaApertura,
            List<RondaTicket> rondas,
            BigDecimal subtotal,
            BigDecimal descuento,
            BigDecimal total
    ) {
        this(comandaId, mesaNumero, codigo, camareroNombre, comensales, fechaApertura, 
             rondas, subtotal, descuento, total, 
             "COBRO", null, null, null, null, null);
    }
}
