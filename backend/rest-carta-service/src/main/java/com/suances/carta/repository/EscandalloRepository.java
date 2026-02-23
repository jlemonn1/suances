package com.suances.carta.repository;

import com.suances.carta.domain.model.Escandallo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EscandalloRepository extends JpaRepository<Escandallo, UUID> {
    Optional<Escandallo> findByPlatoId(UUID platoId);
    
    @Query("SELECT e FROM Escandallo e JOIN FETCH e.detalles d WHERE d.ingrediente.id = :ingredienteId")
    List<Escandallo> findByIngredienteId(@Param("ingredienteId") UUID ingredienteId);
    
    void deleteByPlatoId(UUID platoId);
}
