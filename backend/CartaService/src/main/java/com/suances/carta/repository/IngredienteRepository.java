package com.suances.carta.repository;

import com.suances.carta.domain.model.Ingrediente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IngredienteRepository extends JpaRepository<Ingrediente, UUID> {
    List<Ingrediente> findByActivoTrue();
    
    @Query("SELECT i FROM Ingrediente i JOIN FETCH i.distribuidores WHERE i.id = :id")
    Optional<Ingrediente> findByIdWithDistribuidores(@Param("id") UUID id);
}
