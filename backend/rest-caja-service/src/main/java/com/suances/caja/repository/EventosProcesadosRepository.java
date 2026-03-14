package com.suances.caja.repository;

import com.suances.caja.domain.model.EventosProcesados;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventosProcesadosRepository extends JpaRepository<EventosProcesados, String> {
}
