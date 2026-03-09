package com.suances.sala.client.dto;

import com.suances.sala.domain.model.enums.FranjaTipo;
import java.time.LocalTime;
import java.util.UUID;

public record FranjaResponse(
        UUID id,
        String nombre,
        FranjaTipo tipo,
        LocalTime horaInicio,
        LocalTime horaFin,
        boolean activa
) {}
