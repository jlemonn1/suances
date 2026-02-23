package com.suances.carta.repository;

import com.suances.carta.domain.model.TipoCarta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TipoCartaRepository extends JpaRepository<TipoCarta, UUID> {
    List<TipoCarta> findByActivoTrue();
    
    @Query("SELECT tc FROM TipoCarta tc WHERE tc.activo = true AND tc.horaInicio <= :hora AND tc.horaFin >= :hora")
    Optional<TipoCarta> findActivaByHoraActual(LocalTime hora);
    
    @Query("SELECT tc FROM TipoCarta tc WHERE tc.activo = true AND tc.id != :id AND " +
           "((tc.horaInicio <= :horaInicio AND tc.horaFin > :horaInicio) OR " +
           "(tc.horaInicio < :horaFin AND tc.horaFin >= :horaFin) OR " +
           "(tc.horaInicio >= :horaInicio AND tc.horaFin <= :horaFin))")
    List<TipoCarta> findActivasSolapadasExcluyendoId(UUID id, LocalTime horaInicio, LocalTime horaFin);
}
