package com.suances.sala.client.dto;

import java.util.UUID;

public record ComandaReservaRequest(
    UUID mesaId,
    UUID salaId,
    String camareroNombre,
    Short numeroComensales
) {}
