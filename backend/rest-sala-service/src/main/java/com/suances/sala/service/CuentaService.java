package com.suances.sala.service;

import com.suances.sala.domain.dto.response.TicketCobroResponse;
import com.suances.sala.domain.model.Comanda;
import com.suances.sala.domain.model.ItemComanda;
import com.suances.sala.domain.model.enums.ComandaEstado;
import com.suances.sala.domain.model.enums.TipoRonda;
import com.suances.sala.exception.BusinessRuleException;
import com.suances.sala.exception.ResourceNotFoundException;
import com.suances.sala.repository.ComandaRepository;
import com.suances.sala.repository.ItemComandaRepository;
import com.suances.sala.event.SalaEventProducer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CuentaService {

    private final ComandaRepository comandaRepository;
    private final ItemComandaRepository itemComandaRepository;
    private final ItemComandaService itemComandaService;
    private final MesaOperativaService mesaOperativaService;
    private final SalaEventProducer eventProducer;

    public CuentaService(ComandaRepository comandaRepository,
                         ItemComandaRepository itemComandaRepository,
                         ItemComandaService itemComandaService,
                         MesaOperativaService mesaOperativaService,
                         SalaEventProducer eventProducer) {
        this.comandaRepository = comandaRepository;
        this.itemComandaRepository = itemComandaRepository;
        this.itemComandaService = itemComandaService;
        this.mesaOperativaService = mesaOperativaService;
        this.eventProducer = eventProducer;
    }

    @Transactional
    public Comanda cerrarCuenta(UUID comandaId) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));

        // Validar estado
        if (comanda.getEstado() != ComandaEstado.SERVIDA && comanda.getEstado() != ComandaEstado.EN_PREPARACION) {
            throw new BusinessRuleException("La comanda debe estar en estado SERVIDA o EN_PREPARACION para cerrar la cuenta");
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

        // Generar y publicar ticket de cobro
        TicketCobroResponse ticket = generarTicketCobro(saved);
        eventProducer.publicarCuentaCerrada(saved, ticket);

        return saved;
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

        // Publicar evento
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
}
