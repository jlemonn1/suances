package com.suances.sala.service;

import com.suances.sala.domain.dto.response.TicketCocinaResponse;
import com.suances.sala.domain.model.Comanda;
import com.suances.sala.domain.model.ItemComanda;
import com.suances.sala.domain.model.enums.TipoRonda;
import com.suances.sala.exception.ResourceNotFoundException;
import com.suances.sala.repository.ComandaRepository;
import com.suances.sala.repository.ItemComandaRepository;
import com.suances.sala.repository.MesaOperativaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CocinaService {

    private final ItemComandaRepository itemComandaRepository;
    private final ComandaRepository comandaRepository;
    private final MesaOperativaRepository mesaOperativaRepository;

    public CocinaService(ItemComandaRepository itemComandaRepository,
                         ComandaRepository comandaRepository,
                         MesaOperativaRepository mesaOperativaRepository) {
        this.itemComandaRepository = itemComandaRepository;
        this.comandaRepository = comandaRepository;
        this.mesaOperativaRepository = mesaOperativaRepository;
    }

    @Transactional(readOnly = true)
    public List<TicketCocinaResponse> obtenerComandasEnPreparacion() {
        // Obtener todas las comandas que tienen items EN_COCINA
        return comandaRepository.findAll().stream()
                .filter(c -> tieneItemsEnCocina(c.getId()))
                .map(this::construirTicketCocina)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketCocinaResponse obtenerTicketParaCocina(UUID comandaId) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));

        return construirTicketCocina(comanda);
    }

    private boolean tieneItemsEnCocina(UUID comandaId) {
        return itemComandaRepository.countByComandaIdAndEstado(comandaId, ItemComanda.ItemEstado.EN_COCINA) > 0;
    }

    private TicketCocinaResponse construirTicketCocina(Comanda comanda) {
        // Obtener número de mesa
        Integer mesaNumero = mesaOperativaRepository.findById(comanda.getMesaId())
                .map(m -> m.getNumero())
                .orElse(0);

        // Obtener items en cocina, ordenados por ronda y orden
        List<ItemComanda> items = itemComandaRepository.findByComandaIdAndEstado(
                comanda.getId(), ItemComanda.ItemEstado.EN_COCINA).stream()
                .sorted(Comparator
                        .comparing(ItemComanda::getTipoRonda)
                        .thenComparing(ItemComanda::getOrdenEnRonda))
                .collect(Collectors.toList());

        // Agrupar por ronda para el ticket
        String rondaActual = items.isEmpty() ? "SIN_RONDA" : items.get(0).getTipoRonda().name();

        List<TicketCocinaResponse.ItemTicketCocina> itemsTicket = items.stream()
                .map(item -> new TicketCocinaResponse.ItemTicketCocina(
                        item.getId(),
                        item.getNombrePlato(),
                        item.getCantidad(),
                        item.getNotas(),
                        item.getOrdenEnRonda()
                ))
                .collect(Collectors.toList());

        return new TicketCocinaResponse(
                comanda.getId(),
                mesaNumero,
                comanda.getCodigo(),
                rondaActual,
                itemsTicket,
                itemsTicket.size(),
                items.isEmpty() ? null : items.get(0).getHoraEnvioCocina()
        );
    }
}
