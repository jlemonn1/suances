package com.suances.sala.domain.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record PlatoOperativoResponse(
        UUID platoId,
        String nombre,
        String descripcion,
        BigDecimal precioVenta,
        UUID categoriaId,
        String categoriaNombre,
        BigDecimal stockDisponible,
        Boolean disponible,
        Boolean stockBajo,
        String imagenUrl,
        List<String> ingredientes
) {}
