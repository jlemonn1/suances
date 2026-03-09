package com.suances.sala.domain.dto.response;

import com.suances.sala.domain.model.enums.UnidadMedida;

import java.math.BigDecimal;
import java.util.UUID;

public record IngredienteOperativoResponse(
        UUID ingredienteId,
        String nombre,
        UnidadMedida unidadMedida,
        BigDecimal stockActual,
        BigDecimal umbralAlerta,
        Boolean alertaActiva
) {}
