package com.suances.caja.repository;

import com.suances.caja.domain.model.ComandaCobrada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface ComandaCobradaRepository extends JpaRepository<ComandaCobrada, UUID>,
        JpaSpecificationExecutor<ComandaCobrada> {

    boolean existsByEventId(String eventId);
}
