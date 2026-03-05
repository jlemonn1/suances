package com.suances.reservas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SalaRequest(
        @NotBlank @Size(max = 120) String nombre,
        Integer capacidadMaxima,
        String layoutJson,
        Boolean activa
) {}
