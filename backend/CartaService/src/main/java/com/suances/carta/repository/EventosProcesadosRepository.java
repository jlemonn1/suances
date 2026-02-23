package com.suances.carta.repository;

import com.suances.carta.domain.model.EventosProcesados;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface EventosProcesadosRepository extends JpaRepository<EventosProcesados, UUID> {
    boolean existsByEventId(UUID eventId);
}
