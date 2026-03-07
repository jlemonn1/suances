package com.suances.reservas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateReservaRequest(
        UUID mesaId,
        UUID franjaId,
        LocalDate fecha,
        @Min(1) Short comensales,
        String nombreCliente,
        String telefono,
        @Email String email,
        String notas,
        Boolean force
) {}
