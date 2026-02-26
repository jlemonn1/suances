package com.suances.carta.repository;

import com.suances.carta.domain.enums.CategoriaTipo;
import com.suances.carta.domain.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {
    List<Categoria> findByActivoTrue();
    List<Categoria> findByActivoTrueAndTipo(CategoriaTipo tipo);
    Optional<Categoria> findByNombreIgnoreCaseAndTipo(String nombre, CategoriaTipo tipo);
    boolean existsByNombreIgnoreCaseAndTipo(String nombre, CategoriaTipo tipo);
    boolean existsByNombreIgnoreCaseAndTipoAndIdNot(String nombre, CategoriaTipo tipo, UUID id);
}
