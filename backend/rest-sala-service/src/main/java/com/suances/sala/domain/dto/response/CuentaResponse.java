package com.suances.sala.domain.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record CuentaResponse(
        UUID comandaId,
        String codigo,
        Integer mesaNumero,
        String camareroNombre,
        OffsetDateTime fechaApertura,
        List<CuentaItemResponse> items,
        BigDecimal subtotal,
        BigDecimal descuentoPorcentaje,
        BigDecimal descuentoMonto,
        BigDecimal total,
        Long tiempoTranscurridoMinutos
) {
    public record CuentaItemResponse(
            UUID pedidoId,
            String nombrePlato,
            Integer cantidad,
            BigDecimal precioUnitario,
            BigDecimal subtotal
    ) {}
}
