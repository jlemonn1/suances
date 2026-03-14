package com.suances.caja.domain.dto.response;

import com.suances.caja.domain.enums.MetodoPago;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ComandaCobradaDetalle(
        UUID id,
        UUID sesionCajaId,
        UUID comandaId,
        String mesaNumero,
        MetodoPago metodoPago,
        BigDecimal importeTotal,
        LocalDateTime cobradaAt,
        LocalDateTime createdAt,
        List<ComandaCobradaItemResponse> items
) {}
