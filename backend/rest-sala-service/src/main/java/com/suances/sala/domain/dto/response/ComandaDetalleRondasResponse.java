package com.suances.sala.domain.dto.response;

import com.suances.sala.domain.model.enums.ComandaEstado;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ComandaDetalleRondasResponse(
        UUID id,
        String codigo,
        UUID mesaId,
        Integer mesaNumero,
        String nombreSala,
        UUID camareroId,
        String camareroNombre,
        ComandaEstado estado,
        Integer numeroComensales,
        String notas,
        BigDecimal total,
        BigDecimal descuentoPorcentaje,
        Integer numeroRondaActual,
        OffsetDateTime fechaApertura,
        OffsetDateTime fechaCierre,
        UUID reservaId,
        String nombreClienteReserva,
        List<RondaResponse> rondas
) {
    public record RondaResponse(
            Integer numeroRonda,
            String tipoRonda,
            OffsetDateTime horaEnvio,
            List<ItemRondaResponse> pedidos
    ) {
        public record ItemRondaResponse(
                UUID id,
                UUID platoId,
                String nombrePlato,
                Integer cantidad,
                BigDecimal precioUnitario,
                BigDecimal subtotal,
                String estado,
                String tipoRonda,
                String notas,
                OffsetDateTime horaPedido,
                OffsetDateTime horaEnvioCocina,
                OffsetDateTime horaListo,
                OffsetDateTime horaServido
        ) {}
    }
}
