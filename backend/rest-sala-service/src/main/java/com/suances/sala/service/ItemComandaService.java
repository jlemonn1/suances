package com.suances.sala.service;

import com.suances.sala.domain.dto.request.ItemComandaRequest;
import com.suances.sala.domain.dto.response.ItemComandaResponse;
import com.suances.sala.domain.model.Comanda;
import com.suances.sala.domain.model.ItemComanda;
import com.suances.sala.domain.model.enums.ComandaEstado;
import com.suances.sala.domain.model.enums.TipoRonda;
import com.suances.sala.exception.BusinessRuleException;
import com.suances.sala.exception.ResourceNotFoundException;
import com.suances.sala.repository.ComandaRepository;
import com.suances.sala.repository.ItemComandaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ItemComandaService {

    private final ItemComandaRepository itemComandaRepository;
    private final ComandaRepository comandaRepository;

    public ItemComandaService(ItemComandaRepository itemComandaRepository, 
                              ComandaRepository comandaRepository) {
        this.itemComandaRepository = itemComandaRepository;
        this.comandaRepository = comandaRepository;
    }

    @Transactional
    public List<ItemComandaResponse> agregarItems(UUID comandaId, List<ItemComandaRequest> requests) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));

        // Validar que la comanda esté en estado válido para agregar items
        if (comanda.getEstado() != ComandaEstado.ABIERTA && 
            comanda.getEstado() != ComandaEstado.EN_PREPARACION &&
            comanda.getEstado() != ComandaEstado.SERVIDA) {
            throw new BusinessRuleException("No se pueden agregar items a una comanda en estado: " + comanda.getEstado());
        }

        List<ItemComanda> itemsGuardados = requests.stream()
                .map(request -> {
                    // Simular obtención de precio desde carta-service
                    BigDecimal precioUnitario = obtenerPrecioPlato(request.platoId());

                    ItemComanda item = new ItemComanda();
                    item.setComandaId(comandaId);
                    item.setPlatoId(request.platoId());
                    item.setNombrePlato(request.nombrePlato());
                    item.setCantidad(request.cantidad());
                    item.setPrecioUnitario(precioUnitario);
                    item.setTipoRonda(request.tipoRonda());
                    item.setOrdenEnRonda(request.ordenEnRonda() != null ? request.ordenEnRonda() : 1);
                    item.setEstado(ItemComanda.ItemEstado.PENDIENTE);
                    item.setNotas(request.notas());

                    return itemComandaRepository.save(item);
                })
                .collect(Collectors.toList());

        // Recalcular total de la comanda
        recalcularTotalComanda(comandaId);

        return itemsGuardados.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ItemComandaResponse> listarItemsPorComanda(UUID comandaId) {
        return itemComandaRepository.findByComandaId(comandaId).stream()
                .sorted(Comparator
                        .comparing(ItemComanda::getTipoRonda)
                        .thenComparing(ItemComanda::getOrdenEnRonda))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ItemComandaResponse> listarItemsPendientes(UUID comandaId) {
        return itemComandaRepository.findByComandaIdAndEstado(comandaId, ItemComanda.ItemEstado.PENDIENTE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ItemComandaResponse> listarItemsPorRonda(UUID comandaId, TipoRonda tipoRonda) {
        return itemComandaRepository.findByComandaIdAndTipoRonda(comandaId, tipoRonda).stream()
                .sorted(Comparator.comparing(ItemComanda::getOrdenEnRonda))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ItemComandaResponse modificarItem(UUID itemId, ItemComandaRequest request) {
        ItemComanda item = itemComandaRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado: " + itemId));

        // Solo permitir modificar items PENDIENTES o EN_COCINA
        if (item.getEstado() == ItemComanda.ItemEstado.SERVIDO || 
            item.getEstado() == ItemComanda.ItemEstado.CANCELADO) {
            throw new BusinessRuleException("No se puede modificar un item que ya está servido o cancelado");
        }

        item.setNotas(request.notas());
        
        // Solo actualizar cantidad si está PENDIENTE
        if (item.getEstado() == ItemComanda.ItemEstado.PENDIENTE) {
            item.setCantidad(request.cantidad());
        }

        ItemComanda saved = itemComandaRepository.save(item);
        recalcularTotalComanda(item.getComandaId());

        return mapToResponse(saved);
    }

    @Transactional
    public void cancelarItem(UUID itemId, String motivo) {
        ItemComanda item = itemComandaRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado: " + itemId));

        // No permitir cancelar items ya servidos
        if (item.getEstado() == ItemComanda.ItemEstado.SERVIDO) {
            throw new BusinessRuleException("No se puede cancelar un item ya servido");
        }

        item.setEstado(ItemComanda.ItemEstado.CANCELADO);
        item.setNotas((item.getNotas() != null ? item.getNotas() + " | " : "") + "Cancelado: " + motivo);
        itemComandaRepository.save(item);

        recalcularTotalComanda(item.getComandaId());
    }

    @Transactional
    public void marcarItemsEnCocina(UUID comandaId, TipoRonda ronda) {
        List<ItemComanda> items = itemComandaRepository.findByComandaIdAndTipoRondaAndEstado(
                comandaId, ronda, ItemComanda.ItemEstado.PENDIENTE);

        items.forEach(item -> {
            item.setEstado(ItemComanda.ItemEstado.EN_COCINA);
            item.setHoraEnvioCocina(OffsetDateTime.now());
            itemComandaRepository.save(item);
        });
    }

    @Transactional
    public void marcarRondaLista(UUID comandaId, TipoRonda ronda) {
        List<ItemComanda> items = itemComandaRepository.findByComandaIdAndTipoRondaAndEstado(
                comandaId, ronda, ItemComanda.ItemEstado.EN_COCINA);

        items.forEach(item -> {
            item.setEstado(ItemComanda.ItemEstado.LISTO);
            item.setHoraListo(OffsetDateTime.now());
            itemComandaRepository.save(item);
        });
    }

    @Transactional
    public void marcarRondaServida(UUID comandaId, TipoRonda ronda) {
        List<ItemComanda> items = itemComandaRepository.findByComandaIdAndTipoRondaAndEstado(
                comandaId, ronda, ItemComanda.ItemEstado.LISTO);

        items.forEach(item -> {
            item.setEstado(ItemComanda.ItemEstado.SERVIDO);
            item.setHoraServido(OffsetDateTime.now());
            itemComandaRepository.save(item);
        });
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularTotalComanda(UUID comandaId) {
        return itemComandaRepository.findByComandaIdAndEstadoNot(comandaId, ItemComanda.ItemEstado.CANCELADO).stream()
                .map(ItemComanda::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional
    public void recalcularTotalComanda(UUID comandaId) {
        BigDecimal nuevoTotal = calcularTotalComanda(comandaId);
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));
        comanda.setTotal(nuevoTotal);
        comandaRepository.save(comanda);
    }

    private BigDecimal obtenerPrecioPlato(UUID platoId) {
        // TODO: Integrar con carta-service para obtener precio real
        return new BigDecimal("12.50");
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
                item.getHoraServido()
        );
    }
}
