package com.suances.sala.repository;

import com.suances.sala.domain.model.CartaPlatoIngredienteOperativo;
import com.suances.sala.domain.model.CartaPlatoIngredienteOperativoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CartaPlatoIngredienteOperativoRepository extends JpaRepository<CartaPlatoIngredienteOperativo, CartaPlatoIngredienteOperativoId> {

    List<CartaPlatoIngredienteOperativo> findByPlatoIdOrderByIngredienteOrdenAsc(UUID platoId);

    void deleteByPlatoId(UUID platoId);
}
