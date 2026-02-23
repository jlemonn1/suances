package com.suances.carta.repository;

import com.suances.carta.domain.model.Plato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface PlatoRepository extends JpaRepository<Plato, UUID> {
    List<Plato> findByActivoTrue();
}
