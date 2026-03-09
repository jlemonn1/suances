package com.suances.sala.domain.dto.request;

import com.suances.sala.domain.model.enums.TipoRonda;
import jakarta.validation.constraints.*;

import java.util.UUID;

public record ItemComandaRequest(
        @NotNull(message = "El ID del plato es obligatorio")
        UUID platoId,

        @NotBlank(message = "El nombre del plato es obligatorio")
        @Size(max = 200, message = "El nombre no puede exceder 200 caracteres")
        String nombrePlato,

        @NotNull(message = "El tipo de ronda es obligatorio")
        TipoRonda tipoRonda,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad mínima es 1")
        @Max(value = 99, message = "La cantidad máxima es 99")
        Integer cantidad,

        @Size(max = 500, message = "Las notas no pueden exceder 500 caracteres")
        String notas,

        Integer ordenEnRonda
) {}
