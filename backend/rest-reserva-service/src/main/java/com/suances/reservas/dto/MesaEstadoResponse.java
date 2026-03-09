package com.suances.reservas.dto;

import com.suances.reservas.domain.model.enums.BloqueoTipo;

import java.time.LocalTime;
import java.util.UUID;

public record MesaEstadoResponse(
        UUID mesaId,
        Integer numero,
        UUID salaId,
        Short capacidad,
        Integer posX,
        Integer posY,
        MesaEstado estado,
        ReservaInfo reservaInfo,
        BloqueoInfo bloqueoInfo
) {
    public record ReservaInfo(
            UUID reservaId,
            String codigo,
            String nombreCliente,
            String telefono,
            Short comensales,
            UUID franjaId,
            LocalTime horaInicio,
            LocalTime horaFin
    ) {}

    public record BloqueoInfo(
            BloqueoTipo tipo,
            String motivo
    ) {}

    public enum MesaEstado {
        LIBRE,
        RESERVADA,
        OCUPADA,
        BLOQUEADA
    }
}
