package com.suances.sala.domain.dto.response;

import java.util.List;

public record MesasResponse(
        List<MesaOperativaResponse> mesas,
        MesasResumen resumen
) {
    public record MesasResumen(
            long totalMesas,
            long libres,
            long ocupadas,
            long reservadas
    ) {}
}
