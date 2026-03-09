package com.suances.sala.domain.dto.response;

import com.suances.sala.domain.model.enums.MesaEstadoOperativo;

import java.time.LocalDate;
import java.util.UUID;

public record MesaOperativaResponse(
        UUID id,
        Integer numero,
        UUID salaId,
        String nombreSala,
        Short capacidad,
        MesaEstadoOperativo estadoOperativo,
        UUID comandaActivaId,
        String codigoComanda,
        UUID camareroAsignadoId,
        String nombreCamarero,
        UUID reservaActualId,
        String nombreClienteReserva,
        UUID franjaIdReserva,
        LocalDate fechaReserva
) {}
