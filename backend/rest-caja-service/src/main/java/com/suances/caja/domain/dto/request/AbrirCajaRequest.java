package com.suances.caja.domain.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AbrirCajaRequest(
        @NotNull(message = "El dinero inicial es obligatorio")
        @DecimalMin(value = "0.00", message = "El dinero inicial no puede ser negativo")
        BigDecimal dineroInicial
) {}
