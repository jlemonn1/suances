package com.suances.reservas.dto;

import com.suances.reservas.domain.model.enums.FranjaTipo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record FranjaRequest(
        @NotBlank String nombre,
        @NotNull FranjaTipo tipo,
        @NotNull LocalTime horaInicio,
        @NotNull LocalTime horaFin,
        Boolean activa
) {}
