package com.suances.reservas.dto;

import com.suances.reservas.domain.model.enums.MesaEstado;
import java.util.UUID;

public record MesaResponse(
        UUID id,
        UUID salaId,
        Integer numero,
        short capacidad,
        Integer posX,
        Integer posY,
        Integer ancho,
        Integer alto,
        boolean visibleOnline,
        MesaEstado estado,
        boolean activa
) {}
