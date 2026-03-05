package com.suances.reservas.repository;

import com.suances.reservas.domain.model.WaitlistEntry;
import com.suances.reservas.domain.model.enums.WaitlistEstado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface WaitlistRepository extends JpaRepository<WaitlistEntry, UUID> {

    List<WaitlistEntry> findByFechaAndFranja_IdAndEstadoOrderByPrioridadAsc(
            LocalDate fecha,
            UUID franjaId,
            WaitlistEstado estado);
}
