package com.suances.reservas.event;

import java.time.LocalDate;
import java.util.UUID;

public record ReservaUpdatedEvent(
        UUID eventId,
        UUID id,
        UUID mesaId,
        UUID franjaId,
        LocalDate fecha,
        String codigo,
        String estado,
        String nombreCliente,
        String telefono,
        Integer comensales,
        UUID mesaIdAnterior
) {}
