package com.suances.reservas.dto;

import java.util.UUID;

public record SalaResponse(
        UUID id,
        String nombre,
        Integer capacidadMaxima,
        String layoutJson,
        boolean activa
) {}
