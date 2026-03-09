package com.suances.sala.domain.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

// Ticket para cobro - CON PRECIOS, ordenado por rondas
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
        BigDecimal total
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
}
