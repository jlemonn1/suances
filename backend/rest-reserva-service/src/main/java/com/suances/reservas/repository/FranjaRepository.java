package com.suances.reservas.repository;

import com.suances.reservas.domain.model.FranjaHoraria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FranjaRepository extends JpaRepository<FranjaHoraria, UUID> {

    Optional<FranjaHoraria> findByNombreIgnoreCase(String nombre);
}
