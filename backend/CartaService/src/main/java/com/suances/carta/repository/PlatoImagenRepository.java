package com.suances.carta.repository;

import com.suances.carta.domain.model.PlatoImagen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface PlatoImagenRepository extends JpaRepository<PlatoImagen, UUID> {
    List<PlatoImagen> findByPlatoIdOrderByOrdenAsc(UUID platoId);
    void deleteByPlatoIdAndId(UUID platoId, UUID id);
}
