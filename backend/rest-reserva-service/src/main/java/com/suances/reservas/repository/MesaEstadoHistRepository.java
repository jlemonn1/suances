package com.suances.reservas.repository;

import com.suances.reservas.domain.model.MesaEstadoHist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MesaEstadoHistRepository extends JpaRepository<MesaEstadoHist, UUID> {
}
