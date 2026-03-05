package com.suances.reservas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record ReservaRequest(
        @NotNull UUID mesaId,
        @NotNull UUID franjaId,
        @NotNull LocalDate fecha,
        @NotNull @Min(1) Short comensales,
        @NotBlank String nombreCliente,
        @NotBlank String telefono,
        @Email String email,
        String notas,
        Boolean force
) {}
