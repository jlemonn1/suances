package com.suances.sala.service;

import com.suances.sala.domain.dto.request.ItemComandaRequest;
import com.suances.sala.domain.dto.response.ItemComandaResponse;
import com.suances.sala.domain.model.CartaPlatoOperativo;
import com.suances.sala.domain.model.Comanda;
import com.suances.sala.domain.model.ItemComanda;
import com.suances.sala.domain.model.enums.ComandaEstado;
import com.suances.sala.domain.model.enums.TipoRonda;
import com.suances.sala.event.SalaEventProducer;
import com.suances.sala.event.dto.RondaEnviadaCocinaEvent;
import com.suances.sala.exception.BusinessRuleException;
import com.suances.sala.exception.ResourceNotFoundException;
import com.suances.sala.repository.ComandaRepository;
import com.suances.sala.repository.ItemComandaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ItemComandaService {

    private static final Logger log = LoggerFactory.getLogger(ItemComandaService.class);
    
    private final ItemComandaRepository itemComandaRepository;
    private final ComandaRepository comandaRepository;
    private final CartaSyncService cartaSyncService;
    private final SalaEventProducer salaEventProducer;

    public ItemComandaService(ItemComandaRepository itemComandaRepository, 
                              ComandaRepository comandaRepository,
                              CartaSyncService cartaSyncService,
                              SalaEventProducer salaEventProducer) {
        this.itemComandaRepository = itemComandaRepository;
        this.comandaRepository = comandaRepository;
        this.cartaSyncService = cartaSyncService;
        this.salaEventProducer = salaEventProducer;
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

        List<ItemComanda> itemsGuardados = new ArrayList<>();
        List<ItemComandaResponse> responses = new ArrayList<>();

        for (ItemComandaRequest request : requests) {
            // Obtener plato de carta operativa (precio real y verificación de stock)
            Optional<CartaPlatoOperativo> platoOpt = cartaSyncService.obtenerPlato(request.platoId());
            
            BigDecimal precioUnitario;
            boolean stockBajo = false;
            
            if (platoOpt.isPresent()) {
                CartaPlatoOperativo plato = platoOpt.get();
                precioUnitario = plato.getPrecioVenta();
                
                // Verificar si hay stock bajo (informativo, no bloquea)
                stockBajo = cartaSyncService.verificarStockBajo(request.platoId());
                
                // Actualizar contador de pedidos y stock en carta operativa
                cartaSyncService.actualizarStockPlato(request.platoId(), request.cantidad());
            } else {
                // Si no está en carta operativa, usar precio por defecto (fallback)
                precioUnitario = new BigDecimal("0.00");
                stockBajo = false;
            }

            ItemComanda item = new ItemComanda();
            item.setComandaId(comandaId);
            item.setPlatoId(request.platoId());
            item.setNombrePlato(request.nombrePlato());
            item.setCantidad(request.cantidad());
            item.setPrecioUnitario(precioUnitario);
            item.setTipoRonda(request.tipoRonda());
            item.setOrdenEnRonda(request.ordenEnRonda() != null ? request.ordenEnRonda() : 1);
            item.setNumeroRonda(request.numeroRonda() != null ? request.numeroRonda() : comanda.getRondaActual() != null ? comanda.getRondaActual().ordinal() + 1 : 1);
            item.setEstado(ItemComanda.ItemEstado.PENDIENTE);
            item.setNotas(request.notas());

            ItemComanda saved = itemComandaRepository.save(item);
            itemsGuardados.add(saved);
            
            // Crear respuesta con advertencia de stock
            ItemComandaResponse response = mapToResponseWithStockWarning(saved, stockBajo);
            responses.add(response);
            
            // Nota: El evento a carta-service se envía cuando se lanza a cocina (marcarItemsEnCocina)
        }

        // Recalcular total de la comanda
        recalcularTotalComanda(comandaId);

        return responses;
    }

    @Transactional(readOnly = true)
    public List<ItemComandaResponse> listarItemsPorComanda(UUID comandaId) {
        return itemComandaRepository.findByComandaId(comandaId).stream()
                .sorted(Comparator
                        .comparing(ItemComanda::getTipoRonda)
                        .thenComparing(ItemComanda::getOrdenEnRonda))
                .map(item -> mapToResponse(item, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ItemComandaResponse> listarItemsPendientes(UUID comandaId) {
        return itemComandaRepository.findByComandaIdAndEstado(comandaId, ItemComanda.ItemEstado.PENDIENTE).stream()
                .map(item -> mapToResponse(item, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ItemComandaResponse> listarItemsPorRonda(UUID comandaId, TipoRonda tipoRonda) {
        return itemComandaRepository.findByComandaIdAndTipoRonda(comandaId, tipoRonda).stream()
                .sorted(Comparator.comparing(ItemComanda::getOrdenEnRonda))
                .map(item -> mapToResponse(item, false))
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

        return mapToResponse(saved, false);
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
            
            // Notificar a carta-service para descontar stock cuando se lanza a cocina
            salaEventProducer.publicarItemEnviadoACocina(comandaId, item);
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

    @Transactional
    public void enviarItemsACocina(UUID comandaId, List<UUID> itemIds) {
        // Validar que todos los items pertenezcan a la comanda y estén pendientes
        List<ItemComanda> items = itemComandaRepository.findAllById(itemIds);

        if (items.size() != itemIds.size()) {
            throw new ResourceNotFoundException("Algunos items no fueron encontrados");
        }

        // Validar que todos los items pertenecen a la comanda especificada
        boolean allBelongToComanda = items.stream()
                .allMatch(item -> item.getComandaId().equals(comandaId));
        if (!allBelongToComanda) {
            throw new BusinessRuleException("Todos los items deben pertenecer a la misma comanda");
        }

        // Validar que todos los items estén en estado PENDIENTE
        boolean allPending = items.stream()
                .allMatch(item -> item.getEstado() == ItemComanda.ItemEstado.PENDIENTE);
        if (!allPending) {
            throw new BusinessRuleException("Solo se pueden enviar a cocina items en estado PENDIENTE");
        }

        // Obtener la comanda para actualizar su estado
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));

        // Enviar items a cocina
        OffsetDateTime ahora = OffsetDateTime.now();
        items.forEach(item -> {
            item.setEstado(ItemComanda.ItemEstado.EN_COCINA);
            item.setHoraEnvioCocina(ahora);
            itemComandaRepository.save(item);
        });

        // Agrupar items por ronda y enviar un evento por ronda
        Map<Integer, List<ItemComanda>> itemsPorRonda = items.stream()
                .collect(Collectors.groupingBy(ItemComanda::getNumeroRonda));
        
        itemsPorRonda.forEach((numeroRonda, itemsRonda) -> {
            String tipoRonda = itemsRonda.isEmpty() ? "" : itemsRonda.get(0).getTipoRonda().name();
            
            List<RondaEnviadaCocinaEvent.ItemRondaEnviada> itemsEvent = itemsRonda.stream()
                    .map(item -> new RondaEnviadaCocinaEvent.ItemRondaEnviada(
                            item.getId(),
                            item.getPlatoId(),
                            item.getNombrePlato(),
                            item.getCantidad()
                    ))
                    .collect(Collectors.toList());
            
            RondaEnviadaCocinaEvent evento = new RondaEnviadaCocinaEvent(
                    comandaId,
                    comanda.getMesaId(),
                    numeroRonda,
                    tipoRonda,
                    comanda.getCamareroId(),
                    itemsEvent
            );
            
            salaEventProducer.publicarRondaEnviadaCocina(evento);
            log.info("Evento ronda enviada a cocina publicado para comanda={}, ronda={}, items={}", 
                    comandaId, numeroRonda, itemsEvent.size());
        });

        // Si la comanda está en estado ABIERTA, cambiarla a EN_PREPARACION
        if (comanda.getEstado() == ComandaEstado.ABIERTA) {
            comanda.setEstado(ComandaEstado.EN_PREPARACION);
            comandaRepository.save(comanda);
        }
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

    @Transactional
    public List<ItemComandaResponse> crearYEnviarItemsACocina(UUID comandaId, List<ItemComandaRequest> requests) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));

        // Validar que la comanda esté en estado válido
        if (comanda.getEstado() != ComandaEstado.ABIERTA && 
            comanda.getEstado() != ComandaEstado.EN_PREPARACION) {
            throw new BusinessRuleException("No se pueden agregar items a una comanda en estado: " + comanda.getEstado());
        }

        List<ItemComanda> itemsGuardados = new ArrayList<>();
        List<ItemComandaResponse> responses = new ArrayList<>();
        OffsetDateTime ahora = OffsetDateTime.now();

        for (ItemComandaRequest request : requests) {
            // Obtener plato de carta operativa
            Optional<CartaPlatoOperativo> platoOpt = cartaSyncService.obtenerPlato(request.platoId());
            
            BigDecimal precioUnitario;
            boolean stockBajo = false;
            
            if (platoOpt.isPresent()) {
                CartaPlatoOperativo plato = platoOpt.get();
                precioUnitario = plato.getPrecioVenta();
                stockBajo = cartaSyncService.verificarStockBajo(request.platoId());
                cartaSyncService.actualizarStockPlato(request.platoId(), request.cantidad());
            } else {
                precioUnitario = new BigDecimal("0.00");
            }

            // Crear item directamente en estado EN_COCINA
            ItemComanda item = new ItemComanda();
            item.setComandaId(comandaId);
            item.setPlatoId(request.platoId());
            item.setNombrePlato(request.nombrePlato());
            item.setCantidad(request.cantidad());
            item.setPrecioUnitario(precioUnitario);
            item.setTipoRonda(request.tipoRonda());
            item.setOrdenEnRonda(request.ordenEnRonda() != null ? request.ordenEnRonda() : 1);
            item.setNumeroRonda(request.numeroRonda() != null ? request.numeroRonda() : comanda.getRondaActual() != null ? comanda.getRondaActual().ordinal() + 1 : 1);
            item.setEstado(ItemComanda.ItemEstado.EN_COCINA);  // Directo a cocina
            item.setNotas(request.notas());
            item.setHoraEnvioCocina(ahora);  // Marcar hora de envío

            ItemComanda saved = itemComandaRepository.save(item);
            itemsGuardados.add(saved);
            
            ItemComandaResponse response = mapToResponseWithStockWarning(saved, stockBajo);
            responses.add(response);
        }

        // Agrupar items por ronda y enviar un evento por ronda
        Map<Integer, List<ItemComanda>> itemsPorRonda = itemsGuardados.stream()
                .collect(Collectors.groupingBy(ItemComanda::getNumeroRonda));
        
        itemsPorRonda.forEach((numeroRonda, itemsRonda) -> {
            String tipoRonda = itemsRonda.isEmpty() ? "" : itemsRonda.get(0).getTipoRonda().name();
            
            List<RondaEnviadaCocinaEvent.ItemRondaEnviada> itemsEvent = itemsRonda.stream()
                    .map(item -> new RondaEnviadaCocinaEvent.ItemRondaEnviada(
                            item.getId(),
                            item.getPlatoId(),
                            item.getNombrePlato(),
                            item.getCantidad()
                    ))
                    .collect(Collectors.toList());
            
            RondaEnviadaCocinaEvent evento = new RondaEnviadaCocinaEvent(
                    comandaId,
                    comanda.getMesaId(),
                    numeroRonda,
                    tipoRonda,
                    comanda.getCamareroId(),
                    itemsEvent
            );
            
            salaEventProducer.publicarRondaEnviadaCocina(evento);
            LoggerFactory.getLogger(ItemComandaService.class)
                    .info("Evento ronda enviada a cocina publicado para comanda={}, ronda={}, items={}", 
                            comandaId, numeroRonda, itemsEvent.size());
        });

        // Recalcular total de la comanda
        recalcularTotalComanda(comandaId);
        
        // Si la comanda está en estado ABIERTA, cambiarla a EN_PREPARACION
        if (comanda.getEstado() == ComandaEstado.ABIERTA) {
            comanda.setEstado(ComandaEstado.EN_PREPARACION);
            comandaRepository.save(comanda);
        }

        return responses;
    }



    private ItemComandaResponse mapToResponse(ItemComanda item, boolean advertenciaStock) {
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
                item.getNumeroRonda(),
                item.getEstado(),
                item.getNotas(),
                item.getHoraPedido(),
                item.getHoraEnvioCocina(),
                item.getHoraListo(),
                item.getHoraServido(),
                advertenciaStock
        );
    }

    private ItemComandaResponse mapToResponseWithStockWarning(ItemComanda item, boolean stockBajo) {
        return mapToResponse(item, stockBajo);
    }
}
