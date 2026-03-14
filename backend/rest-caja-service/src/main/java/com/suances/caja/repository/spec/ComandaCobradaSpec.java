package com.suances.caja.repository.spec;

import com.suances.caja.domain.enums.MetodoPago;
import com.suances.caja.domain.model.ComandaCobrada;
import com.suances.caja.domain.model.SesionCaja;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class ComandaCobradaSpec {

    private ComandaCobradaSpec() {}

    public static Specification<ComandaCobrada> porFecha(LocalDate fecha) {
        if (fecha == null) return null;
        LocalDateTime desde = fecha.atStartOfDay();
        LocalDateTime hasta = fecha.plusDays(1).atStartOfDay();
        return (root, query, cb) ->
                cb.and(
                        cb.greaterThanOrEqualTo(root.get("cobradaAt"), desde),
                        cb.lessThan(root.get("cobradaAt"), hasta)
                );
    }

    public static Specification<ComandaCobrada> porFechaDesde(LocalDate fechaDesde) {
        if (fechaDesde == null) return null;
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("cobradaAt"), fechaDesde.atStartOfDay());
    }

    public static Specification<ComandaCobrada> porFechaHasta(LocalDate fechaHasta) {
        if (fechaHasta == null) return null;
        return (root, query, cb) ->
                cb.lessThan(root.get("cobradaAt"), fechaHasta.plusDays(1).atStartOfDay());
    }

    public static Specification<ComandaCobrada> porMetodoPago(MetodoPago metodoPago) {
        if (metodoPago == null) return null;
        return (root, query, cb) -> cb.equal(root.get("metodoPago"), metodoPago);
    }

    public static Specification<ComandaCobrada> porSesionCajaId(UUID sesionCajaId) {
        if (sesionCajaId == null) return null;
        return (root, query, cb) -> {
            Join<ComandaCobrada, SesionCaja> sesion = root.join("sesionCaja");
            return cb.equal(sesion.get("id"), sesionCajaId);
        };
    }

    public static Specification<ComandaCobrada> porMesaNumero(String mesaNumero) {
        if (mesaNumero == null || mesaNumero.isBlank()) return null;
        return (root, query, cb) -> cb.equal(root.get("mesaNumero"), mesaNumero);
    }

    public static Specification<ComandaCobrada> combinar(
            LocalDate fecha,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            MetodoPago metodoPago,
            UUID sesionCajaId,
            String mesaNumero) {

        return Specification.allOf(
                porFecha(fecha),
                porFechaDesde(fechaDesde),
                porFechaHasta(fechaHasta),
                porMetodoPago(metodoPago),
                porSesionCajaId(sesionCajaId),
                porMesaNumero(mesaNumero)
        );
    }
}
