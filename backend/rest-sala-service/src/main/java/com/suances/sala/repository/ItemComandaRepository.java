package com.suances.sala.repository;

import com.suances.sala.domain.model.ItemComanda;
import com.suances.sala.domain.model.enums.TipoRonda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItemComandaRepository extends JpaRepository<ItemComanda, UUID> {

    List<ItemComanda> findByComandaId(UUID comandaId);

    List<ItemComanda> findByComandaIdAndEstado(UUID comandaId, ItemComanda.ItemEstado estado);

    List<ItemComanda> findByComandaIdAndTipoRonda(UUID comandaId, TipoRonda tipoRonda);

    List<ItemComanda> findByComandaIdAndTipoRondaAndEstado(UUID comandaId, TipoRonda tipoRonda, ItemComanda.ItemEstado estado);

    List<ItemComanda> findByComandaIdAndEstadoNot(UUID comandaId, ItemComanda.ItemEstado estado);

    long countByComandaIdAndTipoRondaAndEstado(UUID comandaId, TipoRonda tipoRonda, ItemComanda.ItemEstado estado);

    long countByComandaIdAndEstado(UUID comandaId, ItemComanda.ItemEstado estado);

    List<ItemComanda> findByTipoRondaAndEstado(TipoRonda tipoRonda, ItemComanda.ItemEstado estado);
}
