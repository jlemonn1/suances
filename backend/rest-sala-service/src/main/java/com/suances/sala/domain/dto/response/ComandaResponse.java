package com.suances.sala.domain.dto.response;

import com.suances.sala.domain.model.enums.ComandaEstado;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ComandaResponse(
        UUID id,
        String codigo,
        UUID mesaId,
        UUID camareroId,
        ComandaEstado estado,
        Integer numeroComensales,
        String notas,
        BigDecimal total,
        BigDecimal descuentoPorcentaje,
        OffsetDateTime fechaApertura,
        OffsetDateTime fechaCierre,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
