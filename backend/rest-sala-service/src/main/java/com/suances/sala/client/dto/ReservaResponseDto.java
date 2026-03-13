package com.suances.sala.client.dto;

import java.time.LocalDate;
import java.util.UUID;

public record ReservaResponseDto(
    UUID id,
    String codigo,
    UUID mesaId,
    UUID franjaId,
    LocalDate fecha,
    Short comensales,
    String estado,
    String origen,
    String nombreCliente,
    String telefono,
    String email
) {}
