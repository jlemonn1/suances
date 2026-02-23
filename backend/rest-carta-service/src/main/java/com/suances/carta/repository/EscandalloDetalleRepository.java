package com.suances.carta.repository;

import com.suances.carta.domain.model.EscandalloDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface EscandalloDetalleRepository extends JpaRepository<EscandalloDetalle, UUID> {
    List<EscandalloDetalle> findByEscandalloPlatoId(UUID platoId);
}
