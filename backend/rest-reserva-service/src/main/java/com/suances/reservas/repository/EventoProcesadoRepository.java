package com.suances.reservas.repository;

import com.suances.reservas.domain.model.EventoProcesado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EventoProcesadoRepository extends JpaRepository<EventoProcesado, UUID> {
}
