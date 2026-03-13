package com.suances.sala.domain.dto.response;

import com.suances.sala.domain.model.enums.ComandaEstado;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ComandaHoyResponse(
        UUID id,
        String codigo,
        Integer mesaNumero,
        String nombreSala,
        String camareroNombre,
        ComandaEstado estado,
        Integer numeroComensales,
        BigDecimal total,
        BigDecimal descuentoPorcentaje,
        OffsetDateTime fechaApertura,
        OffsetDateTime ultimaActualizacion,
        OffsetDateTime fechaCierre,
        String notas
) {}
