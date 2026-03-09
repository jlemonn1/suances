package com.suances.sala.domain.dto.response;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

// Ticket para cocina - SIN PRECIOS
public record TicketCocinaResponse(
        UUID comandaId,
        Integer mesaNumero,
        String codigo,
        String ronda,
        List<ItemTicketCocina> items,
        Integer totalItems,
        OffsetDateTime horaEnvio
) {
    public record ItemTicketCocina(
            UUID itemId,
            String nombrePlato,
            Integer cantidad,
            String notas,
            Integer orden
    ) {}
}
