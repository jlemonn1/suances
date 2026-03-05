package com.suances.reservas.dto;

import com.suances.reservas.domain.model.enums.WaitlistEstado;

import java.time.LocalDate;
import java.util.UUID;

public record WaitlistResponse(
        UUID id,
        LocalDate fecha,
        UUID franjaId,
        short comensales,
        String nombreCliente,
        String telefono,
        short prioridad,
        WaitlistEstado estado
) {}
