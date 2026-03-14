package com.suances.caja.domain.dto.response;

import com.suances.caja.domain.enums.MetodoPago;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ComandaCobradaResumen(
        UUID id,
        UUID sesionCajaId,
        UUID comandaId,
        String mesaNumero,
        MetodoPago metodoPago,
        BigDecimal importeTotal,
        LocalDateTime cobradaAt
) {}
