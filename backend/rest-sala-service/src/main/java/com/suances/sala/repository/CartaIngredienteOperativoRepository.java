package com.suances.sala.repository;

import com.suances.sala.domain.model.CartaIngredienteOperativo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartaIngredienteOperativoRepository extends JpaRepository<CartaIngredienteOperativo, UUID> {

    List<CartaIngredienteOperativo> findByAlertaActivaTrue();

    @Query("SELECT i FROM CartaIngredienteOperativo i WHERE i.stockActual IS NOT NULL AND i.umbralAlerta IS NOT NULL AND i.stockActual <= i.umbralAlerta")
    List<CartaIngredienteOperativo> findIngredientesConStockBajo();

    Optional<CartaIngredienteOperativo> findByIngredienteId(UUID ingredienteId);

    boolean existsByIngredienteId(UUID ingredienteId);

    @Query("SELECT i.stockActual FROM CartaIngredienteOperativo i WHERE i.ingredienteId = :ingredienteId")
    Optional<java.math.BigDecimal> findStockActualByIngredienteId(@Param("ingredienteId") UUID ingredienteId);
}
