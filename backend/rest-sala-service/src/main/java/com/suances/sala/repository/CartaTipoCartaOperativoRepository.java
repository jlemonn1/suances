package com.suances.sala.repository;

import com.suances.sala.domain.model.CartaTipoCartaOperativo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartaTipoCartaOperativoRepository extends JpaRepository<CartaTipoCartaOperativo, UUID> {

    List<CartaTipoCartaOperativo> findByActivoTrue();

    @Query("SELECT t FROM CartaTipoCartaOperativo t WHERE t.activo = true AND t.horaInicio <= :hora AND t.horaFin > :hora")
    List<CartaTipoCartaOperativo> findTiposCartaActivosPorHora(@Param("hora") LocalTime hora);

    Optional<CartaTipoCartaOperativo> findByTipoCartaId(UUID tipoCartaId);

    boolean existsByTipoCartaId(UUID tipoCartaId);
}
