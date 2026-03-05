package com.suances.reservas.repository;

import com.suances.reservas.domain.model.Sala;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SalaRepository extends JpaRepository<Sala, UUID> {

    Optional<Sala> findByNombreIgnoreCase(String nombre);
}
