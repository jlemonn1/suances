package com.suances.reservas.repository;

import com.suances.reservas.domain.model.Mesa;
import com.suances.reservas.domain.model.Reserva;
import com.suances.reservas.domain.model.enums.ReservaEstado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReservaRepository extends JpaRepository<Reserva, UUID> {

    Optional<Reserva> findByCodigo(String codigo);

    List<Reserva> findByFechaAndEstado(LocalDate fecha, ReservaEstado estado);

    boolean existsByMesaAndFechaAndFranja_IdAndEstadoNot(
            Mesa mesa,
            LocalDate fecha,
            UUID franjaId,
            ReservaEstado estado);

    List<Reserva> findByFechaAndFranja_IdAndEstadoNot(LocalDate fecha, UUID franjaId, ReservaEstado estado);
}
