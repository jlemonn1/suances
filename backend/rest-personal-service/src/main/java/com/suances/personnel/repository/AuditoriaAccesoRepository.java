package com.suances.personnel.repository;

import com.suances.personnel.domain.model.AuditoriaAcceso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditoriaAccesoRepository extends JpaRepository<AuditoriaAcceso, UUID> {
}
