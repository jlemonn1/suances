package com.suances.sala.repository;

import com.suances.sala.domain.model.MesaOperativa;
import com.suances.sala.domain.model.enums.MesaEstadoOperativo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MesaOperativaRepository extends JpaRepository<MesaOperativa, UUID> {

    List<MesaOperativa> findBySalaId(UUID salaId);

    List<MesaOperativa> findByEstadoOperativo(MesaEstadoOperativo estado);

    List<MesaOperativa> findBySalaIdAndEstadoOperativo(UUID salaId, MesaEstadoOperativo estado);

    List<MesaOperativa> findByCamareroAsignadoId(UUID camareroId);

    Optional<MesaOperativa> findByComandaActivaId(UUID comandaId);

    boolean existsBySalaIdAndNumero(UUID salaId, Integer numero);
}
