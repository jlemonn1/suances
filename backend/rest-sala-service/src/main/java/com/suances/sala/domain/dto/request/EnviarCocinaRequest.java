package com.suances.sala.domain.dto.request;

import com.suances.sala.domain.model.enums.TipoRonda;
import jakarta.validation.constraints.NotNull;

public record EnviarCocinaRequest(
        @NotNull(message = "La ronda es obligatoria")
        TipoRonda ronda
) {}
