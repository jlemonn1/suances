package com.suances.sala.domain.dto.response;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record TipoCartaOperativoResponse(
        UUID tipoCartaId,
        String nombre,
        LocalTime horaInicio,
        LocalTime horaFin,
        Boolean activo,
        List<PlatoOperativoResponse> platos
) {}
