package com.suances.caja.domain.dto.response;

import com.suances.caja.domain.enums.EstadoSesion;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record SesionCajaResponse(
        UUID id,
        LocalDate fecha,
        EstadoSesion estado,
        BigDecimal dineroInicial,
        String abiertaPor,
        String abiertaPorNombre,
        LocalDateTime abiertaAt,
        String cerradaPor,
        String cerradaPorNombre,
        LocalDateTime cerradaAt,
        BigDecimal totalEfectivo,
        BigDecimal totalTarjeta,
        BigDecimal totalMesa,
        BigDecimal totalGeneral
) {}
