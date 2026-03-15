package com.suances.sala.service;

import com.suances.sala.domain.dto.response.TicketCobroResponse;
import com.suances.sala.domain.model.Comanda;
import com.suances.sala.domain.model.ItemComanda;
import com.suances.sala.domain.model.enums.ComandaEstado;
import com.suances.sala.domain.model.enums.TipoRonda;
import com.suances.sala.event.SalaEventProducer;
import com.suances.sala.event.SseEmitterManager;
import com.suances.sala.exception.BusinessRuleException;
import com.suances.sala.exception.ResourceNotFoundException;
import com.suances.sala.repository.ComandaRepository;
import com.suances.sala.repository.ItemComandaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CuentaService {

    private static final Logger log = LoggerFactory.getLogger(CuentaService.class);

    @Value("${app.redis.printer-name:POSIFLEX PP-6900}")
    private String printerName;

    @Value("${app.printer.isabella-name:Isabella}")
    private String isabellaPrinterName;

    @Value("${app.printer.faro-name:Faro}")
    private String faroPrinterName;

    private final ComandaRepository comandaRepository;
    private final ItemComandaRepository itemComandaRepository;
    private final ItemComandaService itemComandaService;
    private final MesaOperativaService mesaOperativaService;
    private final SalaEventProducer eventProducer;
    private final SseEmitterManager sseEmitterManager;

    public CuentaService(ComandaRepository comandaRepository,
                         ItemComandaRepository itemComandaRepository,
                         ItemComandaService itemComandaService,
                         MesaOperativaService mesaOperativaService,
                         SalaEventProducer eventProducer,
                         SseEmitterManager sseEmitterManager) {
        this.comandaRepository = comandaRepository;
        this.itemComandaRepository = itemComandaRepository;
        this.itemComandaService = itemComandaService;
        this.mesaOperativaService = mesaOperativaService;
        this.eventProducer = eventProducer;
        this.sseEmitterManager = sseEmitterManager;
    }

    @Transactional
    public TicketCobroResponse cerrarCuenta(UUID comandaId, String impresoraDestino) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));

        // Validar estado - permitir cerrar cuenta si está ABIERTA, EN_PREPARACION o SERVIDA
        if (comanda.getEstado() != ComandaEstado.ABIERTA && 
            comanda.getEstado() != ComandaEstado.SERVIDA && 
            comanda.getEstado() != ComandaEstado.EN_PREPARACION) {
            throw new BusinessRuleException("La comanda debe estar en estado ABIERTA, SERVIDA o EN_PREPARACION para cerrar la cuenta");
        }

        // Recalcular total por si acaso
        BigDecimal total = itemComandaService.calcularTotalComanda(comandaId);
        comanda.setTotal(total);

        // Aplicar descuento si existe
        if (comanda.getDescuentoPorcentaje().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal factor = BigDecimal.ONE.subtract(
                comanda.getDescuentoPorcentaje().divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
            );
            comanda.setTotal(total.multiply(factor).setScale(2, RoundingMode.HALF_UP));
        }

        comanda.setEstado(ComandaEstado.CUENTA);
        Comanda saved = comandaRepository.save(comanda);

        // Actualizar mesa a estado CUENTA
        mesaOperativaService.actualizarEstadoMesa(
            comanda.getMesaId(), 
            com.suances.sala.domain.model.enums.MesaEstadoOperativo.CUENTA, 
            saved.getId()
        );

        // Emitir evento SSE para actualizar estado de mesa en tiempo real
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("mesaId", comanda.getMesaId());
        eventData.put("estado", "CUENTA");
        eventData.put("comandaId", comanda.getId());
        eventData.put("codigo", saved.getCodigo());
        eventData.put("timestamp", OffsetDateTime.now().toString());
        sseEmitterManager.broadcast("mesa.estado_cambiado", eventData);
        log.info("[SSE] Emitido mesa.estado_cambiado para mesa {} - CUENTA", comanda.getMesaId());

        // Generar y publicar ticket de cobro
        TicketCobroResponse ticket = generarTicketCobro(saved);
        eventProducer.publicarCuentaCerrada(saved, ticket);
        // Use provided printer or default to Isabella
        String impresora = impresoraDestino != null ? impresoraDestino : isabellaPrinterName;
        eventProducer.publicarTicketCuentaImpresion(ticket, impresora);

        return ticket;
    }

    @Transactional(readOnly = true)
    public void reenviarTicket(UUID comandaId, String impresoraDestino) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));

        // Validate that account is closed
        if (comanda.getEstado() != ComandaEstado.CUENTA && comanda.getEstado() != ComandaEstado.COBRADA) {
            throw new BusinessRuleException("Solo se pueden reimprimir tickets de comandas cerradas o cobradas");
        }

        // Generate ticket
        TicketCobroResponse ticket = generarTicketCobro(comanda);

        // Validate printer name
        if (impresoraDestino == null || 
            (!impresoraDestino.equalsIgnoreCase(isabellaPrinterName) && 
             !impresoraDestino.equalsIgnoreCase(faroPrinterName))) {
            throw new IllegalArgumentException("Impresora no válida. Use: " + isabellaPrinterName + " o " + faroPrinterName);
        }

        // Publish to print
        eventProducer.publicarTicketCuentaImpresion(ticket, impresoraDestino);
        log.info("Ticket reenviado para comanda: {} a impresora: {}", comandaId, impresoraDestino);
    }

    public void reimprimirTicketSimple(UUID comandaId, String impresoraDestino) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));

        log.info("[reimprimirTicketSimple] Comanda {} en estado {}", comandaId, comanda.getEstado());

        TicketCobroResponse ticket = generarTicketCobro(comanda);
        eventProducer.publicarTicketCuentaImpresion(ticket, impresoraDestino);
        log.info("Ticket reimpreso para comanda: {} a impresora: {}", comandaId, impresoraDestino);
    }

    @Transactional
    public Comanda cobrarComanda(UUID comandaId, String tipoPago, BigDecimal montoRecibido) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));

        if (comanda.getEstado() != ComandaEstado.CUENTA) {
            throw new BusinessRuleException("La comanda debe estar en estado CUENTA para procesar el cobro");
        }

        if (montoRecibido.compareTo(comanda.getTotal()) < 0) {
            throw new BusinessRuleException("El monto recibido es menor que el total");
        }

        comanda.setEstado(ComandaEstado.COBRADA);
        comanda.setFechaCierre(OffsetDateTime.now());
        Comanda saved = comandaRepository.save(comanda);

        // Liberar mesa
        mesaOperativaService.actualizarEstadoMesa(
            comanda.getMesaId(), 
            com.suances.sala.domain.model.enums.MesaEstadoOperativo.LIBRE, 
            null
        );
        
        // Emitir evento SSE para actualizar estado de mesa en tiempo real
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("mesaId", comanda.getMesaId());
        eventData.put("estado", "LIBRE");
        eventData.put("comandaId", comanda.getId());
        eventData.put("timestamp", OffsetDateTime.now().toString());
        sseEmitterManager.broadcast("mesa.estado_cambiado", eventData);
        log.info("[SSE] Emitido mesa.estado_cambiado para mesa {} - LIBRE", comanda.getMesaId());

        // Publicar evento a Redis
        eventProducer.publicarComandaCobrada(saved, tipoPago, montoRecibido);

        return saved;
    }

    @Transactional
    public Comanda aplicarDescuento(UUID comandaId, BigDecimal porcentaje, String motivo) {
        if (porcentaje.compareTo(BigDecimal.ZERO) < 0 || porcentaje.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BusinessRuleException("El descuento debe estar entre 0 y 100");
        }

        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));

        // Solo permitir descuento en estados CUENTA o anteriores
        if (comanda.getEstado() != ComandaEstado.ABIERTA && 
            comanda.getEstado() != ComandaEstado.EN_PREPARACION &&
            comanda.getEstado() != ComandaEstado.SERVIDA &&
            comanda.getEstado() != ComandaEstado.CUENTA) {
            throw new BusinessRuleException("No se puede aplicar descuento en el estado actual");
        }

        comanda.setDescuentoPorcentaje(porcentaje);
        
        // Recalcular total con descuento
        BigDecimal totalSinDescuento = itemComandaService.calcularTotalComanda(comandaId);
        BigDecimal factor = BigDecimal.ONE.subtract(
            porcentaje.divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
        );
        comanda.setTotal(totalSinDescuento.multiply(factor).setScale(2, RoundingMode.HALF_UP));
        
        // Agregar nota sobre el descuento
        String notaDescuento = String.format("Descuento aplicado: %.0f%% - %s", porcentaje, motivo);
        comanda.setNotas((comanda.getNotas() != null ? comanda.getNotas() + " | " : "") + notaDescuento);

        return comandaRepository.save(comanda);
    }

    @Transactional(readOnly = true)
    public TicketCobroResponse generarTicketCobro(UUID comandaId) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));
        return generarTicketCobro(comanda);
    }

    private TicketCobroResponse generarTicketCobro(Comanda comanda) {
        // Obtener número de mesa
        Integer mesaNumero = mesaOperativaService.obtenerMesa(comanda.getMesaId()).numero();
        String camareroNombre = "Camarero"; // TODO: Obtener de personnel-service

        // Obtener items no cancelados, ordenados por ronda y orden
        List<ItemComanda> items = itemComandaRepository.findByComandaIdAndEstadoNot(
                comanda.getId(), ItemComanda.ItemEstado.CANCELADO).stream()
                .sorted(Comparator
                        .comparing(ItemComanda::getTipoRonda)
                        .thenComparing(ItemComanda::getOrdenEnRonda))
                .collect(Collectors.toList());

        // Agrupar por ronda
        Map<TipoRonda, List<ItemComanda>> itemsPorRonda = items.stream()
                .collect(Collectors.groupingBy(ItemComanda::getTipoRonda));

        // Construir rondas del ticket
        List<TicketCobroResponse.RondaTicket> rondas = itemsPorRonda.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    TipoRonda tipoRonda = entry.getKey();
                    List<ItemComanda> itemsRonda = entry.getValue();

                    List<TicketCobroResponse.ItemTicket> itemsTicket = itemsRonda.stream()
                            .map(item -> new TicketCobroResponse.ItemTicket(
                                    item.getNombrePlato(),
                                    item.getCantidad(),
                                    item.getPrecioUnitario(),
                                    item.getSubtotal(),
                                    item.getNotas()
                            ))
                            .collect(Collectors.toList());

                    BigDecimal subtotalRonda = itemsRonda.stream()
                            .map(ItemComanda::getSubtotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return new TicketCobroResponse.RondaTicket(
                            tipoRonda.name(),
                            itemsTicket,
                            subtotalRonda
                    );
                })
                .collect(Collectors.toList());

        // Calcular subtotal total
        BigDecimal subtotal = items.stream()
                .map(ItemComanda::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calcular descuento
        BigDecimal descuentoMonto = BigDecimal.ZERO;
        if (comanda.getDescuentoPorcentaje().compareTo(BigDecimal.ZERO) > 0) {
            descuentoMonto = subtotal
                    .multiply(comanda.getDescuentoPorcentaje())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        return new TicketCobroResponse(
                comanda.getId(),
                mesaNumero,
                comanda.getCodigo(),
                camareroNombre,
                comanda.getNumeroComensales(),
                comanda.getFechaApertura(),
                rondas,
                subtotal,
                descuentoMonto,
                comanda.getTotal()
        );
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularTotalComanda(UUID comandaId) {
        return itemComandaService.calcularTotalComanda(comandaId);
    }

    public BigDecimal calcularCambio(UUID comandaId, BigDecimal montoRecibido) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));

        if (montoRecibido.compareTo(comanda.getTotal()) < 0) {
            throw new BusinessRuleException("El monto recibido es menor que el total");
        }

        return montoRecibido.subtract(comanda.getTotal());
    }

    @Transactional
    public TicketCobroResponse cancelarCuentaCerrada(UUID comandaId, String motivo, String usuarioNombre) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));

        // Validar que esté en estado CUENTA
        if (comanda.getEstado() != ComandaEstado.CUENTA) {
            throw new BusinessRuleException("Solo se pueden cancelar comandas en estado CUENTA");
        }

        // Guardar total anterior para el ticket
        BigDecimal totalAnterior = comanda.getTotal();

        // Obtener todos los items no cancelados para el ticket
        List<ItemComanda> itemsActuales = itemComandaRepository.findByComandaIdAndEstadoNot(
                comanda.getId(), ItemComanda.ItemEstado.CANCELADO);

        // Cancelar todos los items
        for (ItemComanda item : itemsActuales) {
            item.setEstado(ItemComanda.ItemEstado.CANCELADO);
            itemComandaRepository.save(item);
        }

        // Cambiar estado de comanda a CANCELADA
        comanda.setEstado(ComandaEstado.CANCELADA);
        comanda.setFechaCierre(OffsetDateTime.now());
        comanda.setTotal(BigDecimal.ZERO);
        comanda.setNotas((comanda.getNotas() != null ? comanda.getNotas() + " | " : "") + 
                "Cancelada: " + motivo + " por " + usuarioNombre);
        
        Comanda saved = comandaRepository.save(comanda);

        // Liberar mesa
        mesaOperativaService.actualizarEstadoMesa(
            comanda.getMesaId(), 
            com.suances.sala.domain.model.enums.MesaEstadoOperativo.LIBRE, 
            null
        );

        // Emitir evento SSE
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("mesaId", comanda.getMesaId());
        eventData.put("estado", "LIBRE");
        eventData.put("timestamp", OffsetDateTime.now().toString());
        sseEmitterManager.broadcast("mesa.estado_cambiado", eventData);
        log.info("[SSE] Mesa liberada tras cancelación: {}", comanda.getMesaId());

        // Generar ticket de cancelación
        return generarTicketCancelacion(saved, itemsActuales, motivo, usuarioNombre, totalAnterior);
    }

    @Transactional
    public TicketCobroResponse modificarLineasCuentaCerrada(UUID comandaId, List<UUID> itemIds, String motivo) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));

        // Validar que esté en estado CUENTA
        if (comanda.getEstado() != ComandaEstado.CUENTA) {
            throw new BusinessRuleException("Solo se pueden modificar comandas en estado CUENTA");
        }

        // Guardar total anterior
        BigDecimal totalAnterior = comanda.getTotal();

        // Obtener items a eliminar
        List<ItemComanda> itemsEliminados = new ArrayList<>();
        for (UUID itemId : itemIds) {
            ItemComanda item = itemComandaRepository.findById(itemId)
                    .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado: " + itemId));
            
            if (item.getComandaId().equals(comandaId) && item.getEstado() != ItemComanda.ItemEstado.CANCELADO) {
                item.setEstado(ItemComanda.ItemEstado.CANCELADO);
                itemComandaRepository.save(item);
                itemsEliminados.add(item);
            }
        }

        if (itemsEliminados.isEmpty()) {
            throw new BusinessRuleException("No se encontraron items válidos para eliminar");
        }

        // Recalcular total
        BigDecimal nuevoTotal = itemComandaService.calcularTotalComanda(comandaId);
        comanda.setTotal(nuevoTotal);
        comanda.setNotas((comanda.getNotas() != null ? comanda.getNotas() + " | " : "") + 
                "Modificación: " + motivo + " - Items eliminados: " + itemsEliminados.size());
        
        Comanda saved = comandaRepository.save(comanda);

        // Generar ticket de corrección
        return generarTicketCorreccion(saved, itemsEliminados, motivo, totalAnterior);
    }

    private TicketCobroResponse generarTicketCancelacion(Comanda comanda, List<ItemComanda> itemsCancelados, 
            String motivo, String usuarioNombre, BigDecimal totalAnterior) {
        
        // Obtener número de mesa
        Integer mesaNumero = mesaOperativaService.obtenerMesa(comanda.getMesaId()).numero();
        String camareroNombre = comanda.getCamareroNombre() != null ? comanda.getCamareroNombre() : "Camarero";

        // Convertir items cancelados
        List<TicketCobroResponse.ItemTicket> itemsTicket = itemsCancelados.stream()
                .map(item -> new TicketCobroResponse.ItemTicket(
                        item.getNombrePlato(),
                        item.getCantidad(),
                        item.getPrecioUnitario(),
                        item.getSubtotal(),
                        item.getNotas()
                ))
                .collect(Collectors.toList());

        // Agrupar items cancelados por ronda para el ticket
        List<TicketCobroResponse.RondaTicket> rondas = itemsCancelados.stream()
                .collect(Collectors.groupingBy(ItemComanda::getTipoRonda))
                .entrySet().stream()
                .map(entry -> {
                    List<TicketCobroResponse.ItemTicket> itemsRonda = entry.getValue().stream()
                            .map(item -> new TicketCobroResponse.ItemTicket(
                                    item.getNombrePlato(),
                                    item.getCantidad(),
                                    item.getPrecioUnitario(),
                                    item.getSubtotal(),
                                    item.getNotas()
                            ))
                            .collect(Collectors.toList());
                    
                    BigDecimal subtotalRonda = entry.getValue().stream()
                            .map(ItemComanda::getSubtotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    return new TicketCobroResponse.RondaTicket(
                            entry.getKey().name(),
                            itemsRonda,
                            subtotalRonda
                    );
                })
                .collect(Collectors.toList());

        BigDecimal subtotal = itemsCancelados.stream()
                .map(ItemComanda::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new TicketCobroResponse(
                comanda.getId(),
                mesaNumero,
                comanda.getCodigo(),
                camareroNombre,
                comanda.getNumeroComensales(),
                comanda.getFechaApertura(),
                rondas,
                subtotal,
                BigDecimal.ZERO,
                BigDecimal.ZERO, // Total es 0 tras cancelación
                "CANCELACION",
                motivo,
                usuarioNombre,
                OffsetDateTime.now(),
                totalAnterior,
                itemsTicket
        );
    }

    private TicketCobroResponse generarTicketCorreccion(Comanda comanda, List<ItemComanda> itemsEliminados, 
            String motivo, BigDecimal totalAnterior) {
        
        // Obtener número de mesa
        Integer mesaNumero = mesaOperativaService.obtenerMesa(comanda.getMesaId()).numero();
        String camareroNombre = comanda.getCamareroNombre() != null ? comanda.getCamareroNombre() : "Camarero";

        // Items eliminados para el ticket
        List<TicketCobroResponse.ItemTicket> itemsTicket = itemsEliminados.stream()
                .map(item -> new TicketCobroResponse.ItemTicket(
                        item.getNombrePlato(),
                        item.getCantidad(),
                        item.getPrecioUnitario(),
                        item.getSubtotal(),
                        item.getNotas()
                ))
                .collect(Collectors.toList());

        // Obtener items restantes (no cancelados)
        List<ItemComanda> itemsRestantes = itemComandaRepository.findByComandaIdAndEstadoNot(
                comanda.getId(), ItemComanda.ItemEstado.CANCELADO);

        // Agrupar items restantes por ronda
        List<TicketCobroResponse.RondaTicket> rondas = itemsRestantes.stream()
                .collect(Collectors.groupingBy(ItemComanda::getTipoRonda))
                .entrySet().stream()
                .map(entry -> {
                    List<TicketCobroResponse.ItemTicket> itemsRonda = entry.getValue().stream()
                            .map(item -> new TicketCobroResponse.ItemTicket(
                                    item.getNombrePlato(),
                                    item.getCantidad(),
                                    item.getPrecioUnitario(),
                                    item.getSubtotal(),
                                    item.getNotas()
                            ))
                            .collect(Collectors.toList());
                    
                    BigDecimal subtotalRonda = entry.getValue().stream()
                            .map(ItemComanda::getSubtotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    return new TicketCobroResponse.RondaTicket(
                            entry.getKey().name(),
                            itemsRonda,
                            subtotalRonda
                    );
                })
                .collect(Collectors.toList());

        BigDecimal subtotal = itemsRestantes.stream()
                .map(ItemComanda::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal descuentoMonto = BigDecimal.ZERO;
        if (comanda.getDescuentoPorcentaje().compareTo(BigDecimal.ZERO) > 0) {
            descuentoMonto = subtotal
                    .multiply(comanda.getDescuentoPorcentaje())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        return new TicketCobroResponse(
                comanda.getId(),
                mesaNumero,
                comanda.getCodigo(),
                camareroNombre,
                comanda.getNumeroComensales(),
                comanda.getFechaApertura(),
                rondas,
                subtotal,
                descuentoMonto,
                comanda.getTotal(),
                "CORRECCION",
                motivo,
                null, // Usuario se obtiene del contexto de seguridad si es necesario
                OffsetDateTime.now(),
                totalAnterior,
                itemsTicket
        );
    }
}
