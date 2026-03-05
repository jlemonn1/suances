package com.suances.reservas.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record MesaRequest(
        @NotNull Integer numero,
        @NotNull @Min(1) Integer capacidad,
        Integer posX,
        Integer posY,
        Integer ancho,
        Integer alto,
        Boolean visibleOnline,
        Boolean activa
) {}
