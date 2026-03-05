package com.suances.reservas.dto;

import com.suances.reservas.domain.model.enums.FranjaTipo;
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
