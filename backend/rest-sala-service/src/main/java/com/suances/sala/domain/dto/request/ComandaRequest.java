package com.suances.sala.domain.dto.request;

import jakarta.validation.constraints.*;

import java.util.UUID;

public record ComandaRequest(
        @NotNull(message = "El ID de mesa es obligatorio")
        UUID mesaId,

        @NotNull(message = "El ID de camarero es obligatorio")
        UUID camareroId,

        @NotBlank(message = "El nombre del camarero es obligatorio")
        @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
        String camareroNombre,

        @NotNull(message = "El número de comensales es obligatorio")
        @Min(value = 1, message = "Debe haber al menos 1 comensal")
        @Max(value = 50, message = "No puede haber más de 50 comensales")
        Integer numeroComensales,

        @Size(max = 500, message = "Las notas no pueden exceder 500 caracteres")
        String notas
) {}
