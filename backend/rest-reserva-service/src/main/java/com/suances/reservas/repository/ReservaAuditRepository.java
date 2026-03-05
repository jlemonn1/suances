package com.suances.reservas.repository;

import com.suances.reservas.domain.model.ReservaAudit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReservaAuditRepository extends JpaRepository<ReservaAudit, UUID> {
}
