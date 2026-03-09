package com.suances.sala.repository;

import com.suances.sala.domain.model.CartaPlatoOperativo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartaPlatoOperativoRepository extends JpaRepository<CartaPlatoOperativo, UUID> {

    List<CartaPlatoOperativo> findByDisponibleTrue();

    List<CartaPlatoOperativo> findByCategoriaId(UUID categoriaId);

    List<CartaPlatoOperativo> findByDisponibleTrueAndStockDisponibleGreaterThan(Integer stock);

    @Query("SELECT p FROM CartaPlatoOperativo p WHERE p.disponible = true AND (p.stockDisponible IS NULL OR p.stockDisponible > 0)")
    List<CartaPlatoOperativo> findPlatosDisponiblesConStock();

    @Query("SELECT p FROM CartaPlatoOperativo p WHERE p.disponible = true AND p.stockDisponible IS NOT NULL AND p.stockDisponible <= :umbral")
    List<CartaPlatoOperativo> findPlatosConStockBajo(@Param("umbral") Integer umbral);

    Optional<CartaPlatoOperativo> findByPlatoId(UUID platoId);

    boolean existsByPlatoId(UUID platoId);

    @Query("SELECT p.stockDisponible FROM CartaPlatoOperativo p WHERE p.platoId = :platoId")
    Optional<java.math.BigDecimal> findStockDisponibleByPlatoId(@Param("platoId") UUID platoId);
}
