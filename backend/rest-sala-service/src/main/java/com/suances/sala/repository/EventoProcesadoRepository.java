package com.suances.sala.repository;

import com.suances.sala.domain.model.EventoProcesado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EventoProcesadoRepository extends JpaRepository<EventoProcesado, UUID> {
    boolean existsByEventId(UUID eventId);
}
