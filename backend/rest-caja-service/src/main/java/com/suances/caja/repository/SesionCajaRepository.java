package com.suances.caja.repository;

import com.suances.caja.domain.enums.EstadoSesion;
import com.suances.caja.domain.model.SesionCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface SesionCajaRepository extends JpaRepository<SesionCaja, UUID>,
        JpaSpecificationExecutor<SesionCaja> {

    Optional<SesionCaja> findByEstado(EstadoSesion estado);

    Optional<SesionCaja> findByFecha(LocalDate fecha);
}
