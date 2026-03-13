package com.suances.personnel.repository;

import com.suances.personnel.domain.model.AnotacionPersonal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnotacionPersonalRepository extends JpaRepository<AnotacionPersonal, UUID> {
    List<AnotacionPersonal> findByUsuarioIdOrderByCreatedAtDesc(UUID usuarioId);
    List<AnotacionPersonal> findAllByOrderByCreatedAtDesc();
}
