package com.suances.reservas.dto;

import java.time.LocalDate;
import java.util.UUID;

public record DisponibilidadResponse(
        LocalDate fecha,
        UUID franjaId,
        int mesasDisponibles,
        int capacidadTotal
) {}
