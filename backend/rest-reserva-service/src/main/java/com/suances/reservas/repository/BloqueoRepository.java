package com.suances.reservas.repository;

import com.suances.reservas.domain.model.Bloqueo;
import com.suances.reservas.domain.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BloqueoRepository extends JpaRepository<Bloqueo, UUID> {

    List<Bloqueo> findByMesaAndFechaDesdeLessThanEqualAndFechaHastaGreaterThanEqual(
            Mesa mesa,
            LocalDate fechaDesde,
            LocalDate fechaHasta);

    List<Bloqueo> findByFechaDesdeLessThanEqualAndFechaHastaGreaterThanEqual(
            LocalDate fechaDesde,
            LocalDate fechaHasta);
}
