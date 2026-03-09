package com.suances.sala.repository;

import com.suances.sala.domain.model.CartaEscandalloOperativo;
import com.suances.sala.domain.model.CartaEscandalloOperativoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CartaEscandalloOperativoRepository extends JpaRepository<CartaEscandalloOperativo, CartaEscandalloOperativoId> {

    List<CartaEscandalloOperativo> findByPlatoId(UUID platoId);

    List<CartaEscandalloOperativo> findByIngredienteId(UUID ingredienteId);

    void deleteByPlatoId(UUID platoId);
}
