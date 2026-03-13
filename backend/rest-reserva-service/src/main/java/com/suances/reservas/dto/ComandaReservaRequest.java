package com.suances.reservas.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ComandaReservaRequest(
    @NotNull UUID mesaId,
    @NotNull UUID salaId,
    @NotBlank String camareroNombre,
    @NotNull @Min(1) Short numeroComensales
) {}
