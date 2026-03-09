package com.suances.sala.repository;

import com.suances.sala.domain.model.CartaTipoCartaPlatoOperativo;
import com.suances.sala.domain.model.CartaTipoCartaPlatoOperativoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartaTipoCartaPlatoOperativoRepository extends JpaRepository<CartaTipoCartaPlatoOperativo, CartaTipoCartaPlatoOperativoId> {

    List<CartaTipoCartaPlatoOperativo> findByTipoCartaIdOrderByOrdenAsc(UUID tipoCartaId);

    List<CartaTipoCartaPlatoOperativo> findByPlatoId(UUID platoId);

    Optional<CartaTipoCartaPlatoOperativo> findByTipoCartaIdAndPlatoId(UUID tipoCartaId, UUID platoId);

    void deleteByTipoCartaId(UUID tipoCartaId);

    void deleteByTipoCartaIdAndPlatoId(UUID tipoCartaId, UUID platoId);
}
