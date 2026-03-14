package com.suances.caja.repository.spec;

import com.suances.caja.domain.enums.EstadoSesion;
import com.suances.caja.domain.model.SesionCaja;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class SesionCajaSpec {

    private SesionCajaSpec() {}

    public static Specification<SesionCaja> porFechaDesde(LocalDate fechaDesde) {
        if (fechaDesde == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("fecha"), fechaDesde);
    }

    public static Specification<SesionCaja> porFechaHasta(LocalDate fechaHasta) {
        if (fechaHasta == null) return null;
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("fecha"), fechaHasta);
    }

    public static Specification<SesionCaja> porEstado(EstadoSesion estado) {
        if (estado == null) return null;
        return (root, query, cb) -> cb.equal(root.get("estado"), estado);
    }

    public static Specification<SesionCaja> combinar(LocalDate fechaDesde, LocalDate fechaHasta, EstadoSesion estado) {
        return Specification.allOf(
                porFechaDesde(fechaDesde),
                porFechaHasta(fechaHasta),
                porEstado(estado)
        );
    }
}
