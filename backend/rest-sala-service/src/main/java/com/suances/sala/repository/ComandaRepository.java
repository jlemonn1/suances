package com.suances.sala.repository;

import com.suances.sala.domain.model.Comanda;
import com.suances.sala.domain.model.enums.ComandaEstado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComandaRepository extends JpaRepository<Comanda, UUID> {

    Optional<Comanda> findByCodigo(String codigo);

    Optional<Comanda> findByMesaIdAndEstadoIn(UUID mesaId, List<ComandaEstado> estados);

    boolean existsByMesaIdAndEstadoIn(UUID mesaId, List<ComandaEstado> estados);

    Page<Comanda> findByEstado(ComandaEstado estado, Pageable pageable);

    Page<Comanda> findByCamareroId(UUID camareroId, Pageable pageable);

    List<Comanda> findByMesaId(UUID mesaId);
}
