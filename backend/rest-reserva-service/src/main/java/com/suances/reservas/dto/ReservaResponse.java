package com.suances.reservas.dto;

import com.suances.reservas.domain.model.enums.ReservaEstado;
import com.suances.reservas.domain.model.enums.ReservaOrigen;

import java.time.LocalDate;
import java.util.UUID;

public record ReservaResponse(
        UUID id,
        String codigo,
        UUID mesaId,
        UUID franjaId,
        LocalDate fecha,
        short comensales,
        ReservaEstado estado,
        ReservaOrigen origen,
        String nombreCliente,
        String telefono,
        String email
) {}
