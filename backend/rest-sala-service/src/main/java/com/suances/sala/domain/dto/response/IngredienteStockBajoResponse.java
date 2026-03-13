package com.suances.sala.domain.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record IngredienteStockBajoResponse(
        UUID ingredienteId,
        String nombre,
        BigDecimal stockActual,
        BigDecimal umbralAlerta,
        String unidadMedida
) {}
