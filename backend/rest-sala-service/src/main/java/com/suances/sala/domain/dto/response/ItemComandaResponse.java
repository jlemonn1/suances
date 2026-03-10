package com.suances.sala.domain.dto.response;

import com.suances.sala.domain.model.ItemComanda;
import com.suances.sala.domain.model.enums.TipoRonda;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ItemComandaResponse(
        UUID id,
        UUID comandaId,
        UUID platoId,
        String nombrePlato,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal,
        TipoRonda tipoRonda,
        Integer ordenEnRonda,
        Integer numeroRonda,
        ItemComanda.ItemEstado estado,
        String notas,
        OffsetDateTime horaPedido,
        OffsetDateTime horaEnvioCocina,
        OffsetDateTime horaListo,
        OffsetDateTime horaServido,
        Boolean advertenciaStock
) {
    public ItemComandaResponse {
        if (advertenciaStock == null) {
            advertenciaStock = false;
        }
    }
}
