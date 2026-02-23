package com.suances.carta.repository;

import com.suances.carta.domain.model.Distribuidor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DistribuidorRepository extends JpaRepository<Distribuidor, UUID> {
    List<Distribuidor> findByActivoTrue();
}
