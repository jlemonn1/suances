package com.suances.sala.service;

import com.suances.sala.client.ReservasRestClient;
import com.suances.sala.client.dto.ComandaReservaRequest;
import com.suances.sala.domain.dto.request.ComandaRequest;
import com.suances.sala.domain.dto.response.ComandaDetalleRondasResponse;
import com.suances.sala.domain.dto.response.ComandaHoyResponse;
import com.suances.sala.domain.dto.response.ComandaResponse;
import com.suances.sala.domain.dto.response.MesaOperativaResponse;
import com.suances.sala.domain.model.Comanda;
import com.suances.sala.domain.model.ItemComanda;
import com.suances.sala.domain.model.MesaOperativa;
import com.suances.sala.domain.model.enums.ComandaEstado;
import com.suances.sala.domain.model.enums.TipoRonda;
import com.suances.sala.event.SalaEventProducer;
import com.suances.sala.event.SseEmitterManager;
import com.suances.sala.exception.BusinessRuleException;
import com.suances.sala.exception.ResourceNotFoundException;
import com.suances.sala.repository.ComandaRepository;
import com.suances.sala.repository.ItemComandaRepository;
import com.suances.sala.repository.MesaOperativaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ComandaService {

    private static final Logger log = LoggerFactory.getLogger(ComandaService.class);

    private final ComandaRepository comandaRepository;
    private final ItemComandaRepository itemComandaRepository;
    private final MesaOperativaService mesaOperativaService;
    private final MesaOperativaRepository mesaOperativaRepository;
    private final SalaEventProducer eventProducer;
    private final SseEmitterManager sseEmitterManager;
    private final ReservasRestClient reservasRestClient;

    public ComandaService(ComandaRepository comandaRepository,
                          ItemComandaRepository itemComandaRepository,
                          MesaOperativaService mesaOperativaService,
                          MesaOperativaRepository mesaOperativaRepository,
                          SalaEventProducer eventProducer,
                          SseEmitterManager sseEmitterManager,
                          ReservasRestClient reservasRestClient) {
        this.comandaRepository = comandaRepository;
        this.itemComandaRepository = itemComandaRepository;
        this.mesaOperativaService = mesaOperativaService;
        this.mesaOperativaRepository = mesaOperativaRepository;
        this.eventProducer = eventProducer;
        this.sseEmitterManager = sseEmitterManager;
        this.reservasRestClient = reservasRestClient;
    }

    @Transactional
    public ComandaResponse crearComanda(ComandaRequest request) {
        // Verificar que no haya comanda activa en la mesa
        List<ComandaEstado> estadosActivos = Arrays.asList(
                ComandaEstado.ABIERTA,
                ComandaEstado.EN_PREPARACION,
                ComandaEstado.SERVIDA,
                ComandaEstado.CUENTA
        );

        if (comandaRepository.existsByMesaIdAndEstadoIn(request.mesaId(), estadosActivos)) {
            throw new BusinessRuleException("La mesa ya tiene una comanda activa");
        }

        Comanda comanda = new Comanda();
        comanda.setMesaId(request.mesaId());
        comanda.setCamareroId(request.camareroId());
        comanda.setCamareroNombre(request.camareroNombre());
        comanda.setCodigo(generarCodigoComanda());
        comanda.setNumeroComensales(request.numeroComensales());
        comanda.setNotas(request.notas());
        comanda.setEstado(ComandaEstado.ABIERTA);
        comanda.setTotal(BigDecimal.ZERO);
        comanda.setDescuentoPorcentaje(BigDecimal.ZERO);

        Comanda saved = comandaRepository.save(comanda);
        
        // Actualizar estado de mesa
        mesaOperativaService.actualizarEstadoMesa(
            request.mesaId(), 
            com.suances.sala.domain.model.enums.MesaEstadoOperativo.OCUPADA, 
            saved.getId()
        );
        
        // Emitir evento SSE para actualizar estado de mesa en tiempo real
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("mesaId", request.mesaId());
        eventData.put("estado", "OCUPADA");
        eventData.put("comandaId", saved.getId());
        eventData.put("codigo", saved.getCodigo());
        eventData.put("camareroId", saved.getCamareroId());
        eventData.put("numeroComensales", saved.getNumeroComensales());
        eventData.put("timestamp", OffsetDateTime.now().toString());
        sseEmitterManager.broadcast("mesa.estado_cambiado", eventData);
        log.info("[SSE] Emitido mesa.estado_cambiado para mesa {} - OCUPADA", request.mesaId());
        
        // Publicar evento a Redis
        eventProducer.publicarComandaAbierta(saved);
        
        // Crear reserva en el servicio de reservas
        try {
            MesaOperativa mesa = mesaOperativaRepository.findById(request.mesaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada: " + request.mesaId()));
            
            ComandaReservaRequest reservaRequest = new ComandaReservaRequest(
                    request.mesaId(),
                    mesa.getSalaId(),
                    request.camareroNombre(),
                    request.numeroComensales().shortValue()
            );
            
            var reservaResponse = reservasRestClient.crearReservaDesdeComanda(reservaRequest);
            if (reservaResponse != null) {
                log.info("Reserva creada exitosamente desde comanda: codigo={}", reservaResponse.codigo());
            } else {
                log.warn("No se pudo crear la reserva desde la comanda, pero la comanda se creó correctamente");
            }
        } catch (Exception e) {
            log.error("Error al crear reserva desde comanda, pero la comanda se creó correctamente: {}", e.getMessage());
            // No lanzamos la excepción para no interrumpir la creación de la comanda
        }
        
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ComandaResponse obtenerComanda(UUID id) {
        Comanda comanda = comandaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + id));
        return mapToResponse(comanda);
    }

    @Transactional(readOnly = true)
    public ComandaDetalleRondasResponse obtenerComandaConRondas(UUID id) {
        log.info("=== INICIO obtenerComandaConRondas === id: {}", id);
        
        Comanda comanda = comandaRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Comanda no encontrada: {}", id);
                    return new ResourceNotFoundException("Comanda no encontrada: " + id);
                });
        
        log.info("Comanda cargada: id={}, codigo={}, numeroRondaActual={}, rondaActualTipo={}", 
                comanda.getId(), comanda.getCodigo(), comanda.getNumeroRondaActual(), comanda.getRondaActual());

        List<ItemComanda> items = itemComandaRepository.findByComandaId(id);
        log.info("Items encontrados para comanda {}: {} items", id, items.size());
        
        // Obtener datos de la mesa operativa
        MesaOperativaResponse mesaOperativa = mesaOperativaService.obtenerMesaPorComanda(id);
        log.info("Mesa operativa obtenida: numero={}, nombreSala={}, reservaId={}", 
                mesaOperativa.numero(), mesaOperativa.nombreSala(), mesaOperativa.reservaActualId());
        
        // Log de items con sus numeroRonda
        items.forEach(item -> {
            log.debug("Item: id={}, numeroRonda={}, tipoRonda={}, nombrePlato={}", 
                    item.getId(), item.getNumeroRonda(), item.getTipoRonda(), item.getNombrePlato());
        });

        // Agrupar items por numeroRonda
        Map<Integer, List<ItemComanda>> itemsPorRonda = items.stream()
                .sorted(Comparator.comparing(ItemComanda::getHoraPedido))
                .collect(Collectors.groupingBy(ItemComanda::getNumeroRonda, LinkedHashMap::new, Collectors.toList()));
        
        log.info("Items agrupados por ronda: {} grupos diferentes", itemsPorRonda.size());
        itemsPorRonda.keySet().forEach(numeroRonda -> 
            log.info("  Ronda {}: {} items", numeroRonda, itemsPorRonda.get(numeroRonda).size())
        );

        // Crear lista de rondas
        List<ComandaDetalleRondasResponse.RondaResponse> rondas = itemsPorRonda.entrySet().stream()
                .map(entry -> {
                    Integer numeroRonda = entry.getKey();
                    List<ItemComanda> itemsRonda = entry.getValue();

                    // Obtener el tipo de ronda del primer item (todos deberían ser iguales)
                    String tipoRonda = itemsRonda.isEmpty() ? ""
                            : itemsRonda.get(0).getTipoRonda().toString();

                    // Obtener la hora de envío a cocina (si algún item tiene)
                    OffsetDateTime horaEnvio = itemsRonda.stream()
                            .map(ItemComanda::getHoraEnvioCocina)
                            .filter(Objects::nonNull)
                            .min(Comparator.naturalOrder())
                            .orElse(null);

                    // Mapear items
                    List<ComandaDetalleRondasResponse.RondaResponse.ItemRondaResponse> pedidosResponse = itemsRonda.stream()
                            .map(item -> new ComandaDetalleRondasResponse.RondaResponse.ItemRondaResponse(
                                    item.getId(),
                                    item.getPlatoId(),
                                    item.getNombrePlato(),
                                    item.getCantidad(),
                                    item.getPrecioUnitario(),
                                    item.getSubtotal(),
                                    item.getEstado().toString(),
                                    item.getTipoRonda() != null ? item.getTipoRonda().toString() : "",
                                    item.getNotas(),
                                    item.getHoraPedido(),
                                    item.getHoraEnvioCocina(),
                                    item.getHoraListo(),
                                    item.getHoraServido()
                            ))
                            .collect(Collectors.toList());

                    return new ComandaDetalleRondasResponse.RondaResponse(
                            numeroRonda,
                            tipoRonda,
                            horaEnvio,
                            pedidosResponse
                    );
                })
                .collect(Collectors.toList());

        // Ordenar rondas por número
        rondas.sort(Comparator.comparing(ComandaDetalleRondasResponse.RondaResponse::numeroRonda));
        
        log.info("Retornando comanda con {} rondas, numeroRondaActual={}", rondas.size(), comanda.getNumeroRondaActual());
        log.info("=== FIN obtenerComandaConRondas ===");

        return new ComandaDetalleRondasResponse(
                comanda.getId(),
                comanda.getCodigo(),
                comanda.getMesaId(),
                mesaOperativa.numero(),
                mesaOperativa.nombreSala(),
                comanda.getCamareroId(),
                comanda.getCamareroNombre(),
                comanda.getEstado(),
                comanda.getNumeroComensales(),
                comanda.getNotas(),
                comanda.getTotal(),
                comanda.getDescuentoPorcentaje(),
                comanda.getNumeroRondaActual(),
                comanda.getFechaApertura(),
                comanda.getFechaCierre(),
                mesaOperativa.reservaActualId(),
                mesaOperativa.nombreClienteReserva(),
                rondas
        );
    }

    @Transactional(readOnly = true)
    public Page<ComandaResponse> listarComandas(Pageable pageable) {
        return comandaRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<ComandaResponse> listarComandasPorEstado(ComandaEstado estado, Pageable pageable) {
        return comandaRepository.findByEstado(estado, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<ComandaHoyResponse> listarComandasHoy() {
        // Obtener inicio y fin del día actual
        OffsetDateTime inicioDia = OffsetDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime finDia = OffsetDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        
        // Buscar comandas del día ordenadas por fecha de actualización (más recientes primero)
        List<Comanda> comandas = comandaRepository.findByFechaAperturaBetweenOrderByUpdatedAtDesc(inicioDia, finDia);
        
        return comandas.stream()
                .map(this::mapToHoyResponse)
                .collect(Collectors.toList());
    }

    private ComandaHoyResponse mapToHoyResponse(Comanda comanda) {
        // Obtener número de mesa
        Integer mesaNumero = null;
        String nombreSala = null;
        try {
            MesaOperativaResponse mesa = mesaOperativaService.obtenerMesa(comanda.getMesaId());
            mesaNumero = mesa.numero();
            nombreSala = mesa.nombreSala();
        } catch (Exception e) {
            log.warn("No se pudo obtener información de mesa para comanda {}", comanda.getId());
        }

        return new ComandaHoyResponse(
                comanda.getId(),
                comanda.getCodigo(),
                mesaNumero,
                nombreSala,
                comanda.getCamareroNombre(),
                comanda.getEstado(),
                comanda.getNumeroComensales(),
                comanda.getTotal(),
                comanda.getDescuentoPorcentaje(),
                comanda.getFechaApertura(),
                comanda.getUpdatedAt(),
                comanda.getFechaCierre(),
                comanda.getNotas()
        );
    }

    @Transactional
    public ComandaResponse cambiarEstado(UUID id, ComandaEstado nuevoEstado) {
        Comanda comanda = comandaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + id));

        validarTransicionEstado(comanda.getEstado(), nuevoEstado);

        comanda.setEstado(nuevoEstado);

        if (nuevoEstado == ComandaEstado.COBRADA || nuevoEstado == ComandaEstado.CANCELADA) {
            comanda.setFechaCierre(OffsetDateTime.now());
        }

        Comanda saved = comandaRepository.save(comanda);
        return mapToResponse(saved);
    }

    @Transactional
    public void cancelarComanda(UUID id, String motivo) {
        Comanda comanda = comandaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + id));

        // No permitir cancelar si hay pedidos servidos (validación básica)
        // En implementación completa, verificar pedidos
        if (comanda.getEstado() == ComandaEstado.COBRADA) {
            throw new BusinessRuleException("No se puede cancelar una comanda ya cobrada");
        }

        comanda.setEstado(ComandaEstado.CANCELADA);
        comanda.setFechaCierre(OffsetDateTime.now());
        comanda.setNotas((comanda.getNotas() != null ? comanda.getNotas() + " | " : "") + "Cancelada: " + motivo);

        comandaRepository.save(comanda);
    }

    @Transactional
    public void actualizarTotal(UUID comandaId, BigDecimal nuevoTotal) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + comandaId));

        comanda.setTotal(nuevoTotal);
        comandaRepository.save(comanda);
    }

    @Transactional
    public Integer crearNuevaRonda(UUID comandaId) {
        log.info("=== INICIO crearNuevaRonda === comandaId: {}", comandaId);
        
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> {
                    log.error("Comanda no encontrada: {}", comandaId);
                    return new ResourceNotFoundException("Comanda no encontrada: " + comandaId);
                });
        
        log.info("Comanda encontrada: id={}, numeroRondaActual={}, rondaActualTipo={}, estado={}", 
                comanda.getId(), comanda.getNumeroRondaActual(), comanda.getRondaActual(), comanda.getEstado());

        // Solo permitir crear nueva ronda si la comanda está abierta o en preparación
        if (comanda.getEstado() != ComandaEstado.ABIERTA &&
            comanda.getEstado() != ComandaEstado.EN_PREPARACION) {
            log.error("Estado no permitido para crear ronda: {} (comandaId: {})", comanda.getEstado(), comandaId);
            throw new BusinessRuleException("No se pueden crear nuevas rondas en una comanda en estado: " + comanda.getEstado());
        }

        // Incrementar el número de ronda
        Integer nuevoNumeroRonda = comanda.getNumeroRondaActual() + 1;
        log.info("Incrementando ronda: {} -> {}", comanda.getNumeroRondaActual(), nuevoNumeroRonda);
        
        comanda.setNumeroRondaActual(nuevoNumeroRonda);

        // Avanzar el tipo de ronda si es posible
        TipoRonda rondaActual = comanda.getRondaActual();
        if (rondaActual != null) {
            TipoRonda[] rondas = TipoRonda.values();
            int index = Arrays.asList(rondas).indexOf(rondaActual);
            if (index < rondas.length - 1) {
                TipoRonda nuevaRondaTipo = rondas[index + 1];
                log.info("Avanzando tipo de ronda: {} -> {}", rondaActual, nuevaRondaTipo);
                comanda.setRondaActual(nuevaRondaTipo);
            } else {
                log.info("Tipo de ronda ya en valor máximo: {}", rondaActual);
            }
        }

        Comanda saved = comandaRepository.save(comanda);
        log.info("Comanda guardada en BD: id={}, numeroRondaActual={}", 
                saved.getId(), saved.getNumeroRondaActual());
        
        log.info("=== FIN crearNuevaRonda === retornando numeroRonda: {}", nuevoNumeroRonda);
        return nuevoNumeroRonda;
    }

    private String generarCodigoComanda() {
        // Generar código único CMD-XXXX
        return "CMD-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private void validarTransicionEstado(ComandaEstado actual, ComandaEstado nuevo) {
        // Validaciones básicas de transición de estado
        switch (actual) {
            case ABIERTA:
                if (nuevo != ComandaEstado.EN_PREPARACION && nuevo != ComandaEstado.CANCELADA) {
                    throw new BusinessRuleException("Transición de estado no permitida");
                }
                break;
            case EN_PREPARACION:
                if (nuevo != ComandaEstado.SERVIDA && nuevo != ComandaEstado.CANCELADA) {
                    throw new BusinessRuleException("Transición de estado no permitida");
                }
                break;
            case SERVIDA:
                if (nuevo != ComandaEstado.CUENTA && nuevo != ComandaEstado.ABIERTA) {
                    throw new BusinessRuleException("Transición de estado no permitida");
                }
                break;
            case CUENTA:
                if (nuevo != ComandaEstado.COBRADA && nuevo != ComandaEstado.ABIERTA) {
                    throw new BusinessRuleException("Transición de estado no permitida");
                }
                break;
            case COBRADA:
            case CANCELADA:
                throw new BusinessRuleException("No se puede cambiar el estado de una comanda finalizada");
        }
    }

    private ComandaResponse mapToResponse(Comanda comanda) {
        return new ComandaResponse(
                comanda.getId(),
                comanda.getCodigo(),
                comanda.getMesaId(),
                comanda.getCamareroId(),
                comanda.getEstado(),
                comanda.getNumeroComensales(),
                comanda.getNotas(),
                comanda.getTotal(),
                comanda.getDescuentoPorcentaje(),
                comanda.getFechaApertura(),
                comanda.getFechaCierre(),
                comanda.getCreatedAt(),
                comanda.getUpdatedAt()
        );
    }
}
