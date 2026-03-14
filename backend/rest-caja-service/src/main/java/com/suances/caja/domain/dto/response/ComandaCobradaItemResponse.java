package com.suances.caja.domain.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record ComandaCobradaItemResponse(
        UUID platoId,
        String platoNombre,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal
) {}
