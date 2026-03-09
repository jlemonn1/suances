package com.suances.sala.service;

import com.suances.sala.domain.dto.response.ItemComandaResponse;
import com.suances.sala.domain.model.ItemComanda;
import com.suances.sala.domain.model.enums.TipoRonda;
import com.suances.sala.exception.BusinessRuleException;
import com.suances.sala.exception.ResourceNotFoundException;
import com.suances.sala.repository.ItemComandaRepository;
import com.suances.sala.event.SalaEventProducer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BarService {

    private final ItemComandaRepository itemComandaRepository;
    private final SalaEventProducer eventProducer;

    public BarService(ItemComandaRepository itemComandaRepository, 
                      SalaEventProducer eventProducer) {
        this.itemComandaRepository = itemComandaRepository;
        this.eventProducer = eventProducer;
    }

    @Transactional(readOnly = true)
    public List<ItemComandaResponse> obtenerBebidasPendientes() {
        return itemComandaRepository.findByTipoRondaAndEstado(TipoRonda.BEBIDA, ItemComanda.ItemEstado.PENDIENTE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void marcarBebidaServida(UUID itemId) {
        ItemComanda item = itemComandaRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Bebida no encontrada: " + itemId));

        if (item.getTipoRonda() != TipoRonda.BEBIDA) {
            throw new BusinessRuleException("El item no es una bebida");
        }

        item.setEstado(ItemComanda.ItemEstado.SERVIDO);
        item.setHoraServido(OffsetDateTime.now());
        itemComandaRepository.save(item);
    }

    private ItemComandaResponse mapToResponse(ItemComanda item) {
        return new ItemComandaResponse(
                item.getId(),
                item.getComandaId(),
                item.getPlatoId(),
                item.getNombrePlato(),
                item.getCantidad(),
                item.getPrecioUnitario(),
                item.getSubtotal(),
                item.getTipoRonda(),
                item.getOrdenEnRonda(),
                item.getEstado(),
                item.getNotas(),
                item.getHoraPedido(),
                item.getHoraEnvioCocina(),
                item.getHoraListo(),
                item.getHoraServido(),
                false
        );
    }
}
