package com.suances.sala.repository;

import com.suances.sala.domain.model.SalaOperativa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalaOperativaRepository extends JpaRepository<SalaOperativa, UUID> {

    List<SalaOperativa> findByActivaTrueOrderByOrdenAsc();

    List<SalaOperativa> findByFechaSincronizacion(LocalDate fecha);

    Optional<SalaOperativa> findByNombreIgnoreCase(String nombre);

    void deleteByFechaSincronizacionBefore(LocalDate fecha);
}
