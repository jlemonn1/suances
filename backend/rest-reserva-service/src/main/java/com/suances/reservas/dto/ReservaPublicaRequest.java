package com.suances.reservas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record ReservaPublicaRequest(
        @NotNull LocalDate fecha,
        @NotNull UUID franjaId,
        @NotNull @Min(1) Short comensales,
        @NotBlank String nombre,
        @NotBlank String telefono,
        @Email String email,
        String preferencias
) {}
