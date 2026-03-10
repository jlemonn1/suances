package com.suances.sala.domain.dto.request;

import com.suances.sala.domain.model.enums.TipoRonda;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record EnviarCocinaRequest(
        @NotNull(message = "La ronda es obligatoria")
        TipoRonda ronda,

        @NotEmpty(message = "Debe seleccionar al menos un item")
        List<UUID> itemIds
) {}
