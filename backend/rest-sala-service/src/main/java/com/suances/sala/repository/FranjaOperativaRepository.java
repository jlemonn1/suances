package com.suances.sala.repository;

import com.suances.sala.domain.model.FranjaOperativa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FranjaOperativaRepository extends JpaRepository<FranjaOperativa, UUID> {

    List<FranjaOperativa> findByActivaTrue();

    List<FranjaOperativa> findByFechaSincronizacion(LocalDate fecha);

    Optional<FranjaOperativa> findByNombreIgnoreCase(String nombre);

    void deleteByFechaSincronizacionBefore(LocalDate fecha);
}
