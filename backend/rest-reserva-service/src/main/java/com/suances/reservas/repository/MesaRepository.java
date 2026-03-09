package com.suances.reservas.repository;

import com.suances.reservas.domain.model.Mesa;
import com.suances.reservas.domain.model.Sala;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MesaRepository extends JpaRepository<Mesa, UUID> {

    List<Mesa> findBySalaAndActivaTrue(Sala sala);

    Optional<Mesa> findBySalaAndNumero(Sala sala, Integer numero);

    List<Mesa> findByActivaTrueAndVisibleOnlineTrue();

    List<Mesa> findByActivaTrue();
}
