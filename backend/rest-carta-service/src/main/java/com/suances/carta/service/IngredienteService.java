package com.suances.carta.service;

import com.suances.carta.domain.model.Categoria;
import com.suances.carta.domain.model.Distribuidor;
import com.suances.carta.domain.model.Escandallo;
import com.suances.carta.domain.model.EscandalloDetalle;
import com.suances.carta.domain.model.Ingrediente;
import com.suances.carta.dto.event.CartaEventResponse;
import com.suances.carta.dto.event.StockBajoEvent;
import com.suances.carta.dto.request.IngredienteRequest;
import com.suances.carta.dto.response.IngredienteResponse;
import com.suances.carta.event.SseEmitterManager;
import com.suances.carta.exception.ResourceNotFoundException;
import com.suances.carta.repository.CategoriaRepository;
import com.suances.carta.repository.DistribuidorRepository;
import com.suances.carta.repository.EscandalloRepository;
import com.suances.carta.repository.IngredienteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IngredienteService {

    private static final Logger logger = LoggerFactory.getLogger(IngredienteService.class);

    private final IngredienteRepository ingredienteRepository;
    private final DistribuidorRepository distribuidorRepository;
    private final EscandalloRepository escandalloRepository;
    private final CategoriaRepository categoriaRepository;
    private final EventProducer eventProducer;
    private final SseEmitterManager sseEmitterManager;

    public IngredienteService(IngredienteRepository ingredienteRepository,
            DistribuidorRepository distribuidorRepository,
            EscandalloRepository escandalloRepository,
            CategoriaRepository categoriaRepository,
            EventProducer eventProducer,
            SseEmitterManager sseEmitterManager) {
        this.ingredienteRepository = ingredienteRepository;
        this.distribuidorRepository = distribuidorRepository;
        this.escandalloRepository = escandalloRepository;
        this.categoriaRepository = categoriaRepository;
        this.eventProducer = eventProducer;
        this.sseEmitterManager = sseEmitterManager;
    }

    @Transactional
    public IngredienteResponse crear(IngredienteRequest request) {
        Ingrediente ingrediente = new Ingrediente();
        ingrediente.setNombre(request.getNombre());
        ingrediente.setUnidadMedida(request.getUnidadMedida());
        ingrediente.setPrecioPorUnidad(request.getPrecioPorUnidad());
        ingrediente.setStockActual(request.getStockActual());
        ingrediente.setUmbralAlerta(request.getUmbralAlerta());
        ingrediente.setActivo(true);

        if (request.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + request.getCategoriaId()));
            ingrediente.setCategoria(categoria);
        }

        Ingrediente saved = ingredienteRepository.save(ingrediente);

        // Publicar evento de ingrediente creado
        com.suances.carta.dto.event.IngredienteChangedEvent event = 
            new com.suances.carta.dto.event.IngredienteChangedEvent(
                "carta.ingrediente.created",
                saved.getId(),
                saved.getNombre(),
                saved.getUnidadMedida(),
                saved.getStockActual(),
                saved.getUmbralAlerta(),
                saved.getActivo()
            );
        eventProducer.publicarIngredienteCreado(event);

        return IngredienteResponse.fromEntity(saved);
    }

    public List<IngredienteResponse> listar(Boolean activo) {
        List<Ingrediente> ingredientes;
        if (Boolean.TRUE.equals(activo)) {
            ingredientes = ingredienteRepository.findByActivoTrue();
        } else {
            ingredientes = ingredienteRepository.findAll();
        }
        return ingredientes.stream()
                .map(IngredienteResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public IngredienteResponse obtener(UUID id) {
        Ingrediente ingrediente = ingredienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado: " + id));
        return IngredienteResponse.fromEntity(ingrediente);
    }

    @Transactional
    public IngredienteResponse actualizar(UUID id, IngredienteRequest request) {
        Ingrediente ingrediente = ingredienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado: " + id));

        boolean precioCambio = !ingrediente.getPrecioPorUnidad().equals(request.getPrecioPorUnidad());
        BigDecimal stockAnterior = ingrediente.getStockActual();

        ingrediente.setNombre(request.getNombre());
        ingrediente.setUnidadMedida(request.getUnidadMedida());
        ingrediente.setPrecioPorUnidad(request.getPrecioPorUnidad());
        ingrediente.setStockActual(request.getStockActual());
        ingrediente.setUmbralAlerta(request.getUmbralAlerta());

        if (request.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + request.getCategoriaId()));
            ingrediente.setCategoria(categoria);
        } else {
            ingrediente.setCategoria(null);
        }

        Ingrediente saved = ingredienteRepository.save(ingrediente);

        // Publicar evento de ingrediente actualizado
        com.suances.carta.dto.event.IngredienteChangedEvent event = 
            new com.suances.carta.dto.event.IngredienteChangedEvent(
                "carta.ingrediente.updated",
                saved.getId(),
                saved.getNombre(),
                saved.getUnidadMedida(),
                saved.getStockActual(),
                saved.getUmbralAlerta(),
                saved.getActivo()
            );
        eventProducer.publicarIngredienteActualizado(event);

        // Publicar evento de cambio de stock si cambió
        if (!stockAnterior.equals(saved.getStockActual())) {
            com.suances.carta.dto.event.IngredienteChangedEvent stockEvent = 
                new com.suances.carta.dto.event.IngredienteChangedEvent(
                    "carta.stock.changed",
                    saved.getId(),
                    saved.getNombre(),
                    saved.getUnidadMedida(),
                    saved.getStockActual(),
                    saved.getUmbralAlerta(),
                    saved.getActivo()
                );
            eventProducer.publicarStockChanged(stockEvent);
        }

        if (precioCambio) {
            recalcularPorIngrediente(id);
        }

        resetearAlertaSiStockSuficiente(id);

        return IngredienteResponse.fromEntity(saved);
    }

    @Transactional
    public void desactivar(UUID id) {
        Ingrediente ingrediente = ingredienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado: " + id));
        ingrediente.setActivo(false);
        Ingrediente saved = ingredienteRepository.save(ingrediente);

        // Publicar evento de ingrediente actualizado (desactivado)
        com.suances.carta.dto.event.IngredienteChangedEvent event = 
            new com.suances.carta.dto.event.IngredienteChangedEvent(
                "carta.ingrediente.updated",
                saved.getId(),
                saved.getNombre(),
                saved.getUnidadMedida(),
                saved.getStockActual(),
                saved.getUmbralAlerta(),
                saved.getActivo()
            );
        eventProducer.publicarIngredienteActualizado(event);
    }

    @Transactional
    public void activar(UUID id) {
        Ingrediente ingrediente = ingredienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado: " + id));
        ingrediente.setActivo(true);
        Ingrediente saved = ingredienteRepository.save(ingrediente);

        // Publicar evento de ingrediente actualizado (activado)
        com.suances.carta.dto.event.IngredienteChangedEvent event = 
            new com.suances.carta.dto.event.IngredienteChangedEvent(
                "carta.ingrediente.updated",
                saved.getId(),
                saved.getNombre(),
                saved.getUnidadMedida(),
                saved.getStockActual(),
                saved.getUmbralAlerta(),
                saved.getActivo()
            );
        eventProducer.publicarIngredienteActualizado(event);
    }

    @Transactional
    public void asociarDistribuidor(UUID ingredienteId, UUID distribuidorId) {
        Ingrediente ingrediente = ingredienteRepository.findById(ingredienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado: " + ingredienteId));
        Distribuidor distribuidor = distribuidorRepository.findById(distribuidorId)
                .orElseThrow(() -> new ResourceNotFoundException("Distribuidor no encontrado: " + distribuidorId));

        ingrediente.getDistribuidores().add(distribuidor);
        ingredienteRepository.save(ingrediente);
    }

    @Transactional
    public void desasociarDistribuidor(UUID ingredienteId, UUID distribuidorId) {
        Ingrediente ingrediente = ingredienteRepository.findById(ingredienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado: " + ingredienteId));

        ingrediente.getDistribuidores().removeIf(d -> d.getId().equals(distribuidorId));
        ingredienteRepository.save(ingrediente);
    }

    @Transactional
    public void recalcularPorIngrediente(UUID ingredienteId) {
        List<Escandallo> escandallos = escandalloRepository.findByIngredienteId(ingredienteId);

        for (Escandallo escandallo : escandallos) {
            BigDecimal nuevoCoste = BigDecimal.ZERO;
            for (var detalle : escandallo.getDetalles()) {
                if (detalle.getIngrediente().getId().equals(ingredienteId)) {
                    BigDecimal coste = detalle.getCantidad().multiply(ingredienteRepository.findById(ingredienteId)
                            .map(Ing -> Ing.getPrecioPorUnidad())
                            .orElse(BigDecimal.ZERO));
                    nuevoCoste = nuevoCoste.add(coste);
                } else {
                    BigDecimal coste = detalle.getCantidad().multiply(detalle.getIngrediente().getPrecioPorUnidad());
                    nuevoCoste = nuevoCoste.add(coste);
                }
            }
            escandallo.setCosteTotalSnapshot(nuevoCoste);
            escandalloRepository.save(escandallo);
        }
    }

    @Transactional
    public void descontarStock(UUID platoId, int cantidad) {
        Escandallo escandallo = escandalloRepository.findByPlatoId(platoId)
                .orElse(null);

        if (escandallo == null || escandallo.getDetalles() == null) {
            return;
        }

        for (EscandalloDetalle detalle : escandallo.getDetalles()) {
            Ingrediente ingrediente = detalle.getIngrediente();
            BigDecimal cantidadDescontar = detalle.getCantidad().multiply(BigDecimal.valueOf(cantidad));

            BigDecimal stockPrevio = ingrediente.getStockActual();
            BigDecimal stockNuevo = stockPrevio.subtract(cantidadDescontar);
            if (stockNuevo.compareTo(BigDecimal.ZERO) < 0) {
                stockNuevo = BigDecimal.ZERO;
            }

            boolean cruzoumbAlerta = stockPrevio.compareTo(ingrediente.getUmbralAlerta()) >= 0
                    && stockNuevo.compareTo(ingrediente.getUmbralAlerta()) < 0;

            boolean cruzoumbCritico = stockPrevio.compareTo(BigDecimal.ZERO) > 0
                    && stockNuevo.compareTo(BigDecimal.ZERO) == 0;

            ingrediente.setStockActual(stockNuevo);

            if (cruzoumbCritico) {
                ingrediente.setAlertaEnviada(true);
                publicarEventoStockCritico(ingrediente);
            } else if (cruzoumbAlerta) {
                ingrediente.setAlertaEnviada(false);
                publicarEventoStockBajo(ingrediente);
            }

            // Siempre publicar evento de stock changed
            com.suances.carta.dto.event.IngredienteChangedEvent stockEvent = 
                new com.suances.carta.dto.event.IngredienteChangedEvent(
                    "carta.stock.changed",
                    ingrediente.getId(),
                    ingrediente.getNombre(),
                    ingrediente.getUnidadMedida(),
                    ingrediente.getStockActual(),
                    ingrediente.getUmbralAlerta(),
                    ingrediente.getActivo()
                );
            eventProducer.publicarStockChanged(stockEvent);

            ingredienteRepository.save(ingrediente);
        }

        verificarYResetearAlertasPorPlato(platoId);
    }

    private void publicarEventoStockBajo(Ingrediente ingrediente) {
        StockBajoEvent event = new StockBajoEvent(
                ingrediente.getId(),
                ingrediente.getNombre(),
                ingrediente.getStockActual(),
                ingrediente.getUmbralAlerta()
        );
        
        eventProducer.publicarStockBajo(event);
        
        CartaEventResponse response = CartaEventResponse.stockBajo(
                ingrediente.getId(),
                ingrediente.getNombre(),
                event
        );
        
        sseEmitterManager.broadcast("stock_bajo", response);
        
        logger.info("[CARTA] Evento stock bajo publicado: {} - Stock: {} / Umbral: {}", 
                ingrediente.getNombre(), ingrediente.getStockActual(), ingrediente.getUmbralAlerta());
    }

    private void publicarEventoStockCritico(Ingrediente ingrediente) {
        StockBajoEvent event = new StockBajoEvent(
                ingrediente.getId(),
                ingrediente.getNombre(),
                ingrediente.getStockActual(),
                BigDecimal.ZERO
        );
        
        eventProducer.publicarStockBajo(event);
        
        CartaEventResponse response = CartaEventResponse.stockCritico(
                ingrediente.getId(),
                ingrediente.getNombre(),
                event
        );
        
        sseEmitterManager.broadcast("stock_critico", response);
        
        logger.info("[CARTA] Evento stock crítico publicado: {} - Stock: {}", 
                ingrediente.getNombre(), ingrediente.getStockActual());
    }

    private void publicarEventoStockRecuperado(Ingrediente ingrediente) {
        CartaEventResponse response = CartaEventResponse.stockRecuperado(
                ingrediente.getId(),
                ingrediente.getNombre(),
                new StockBajoEvent(
                        ingrediente.getId(),
                        ingrediente.getNombre(),
                        ingrediente.getStockActual(),
                        ingrediente.getUmbralAlerta()
                )
        );
        
        sseEmitterManager.broadcast("stock_recuperado", response);
        
        logger.info("[CARTA] Evento stock recuperado publicado: {} - Stock: {}", 
                ingrediente.getNombre(), ingrediente.getStockActual());
    }

    public boolean verificarCruceUmbral(UUID ingredienteId) {
        Ingrediente ingrediente = ingredienteRepository.findById(ingredienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado: " + ingredienteId));

        boolean cruzoumbAlerta = !ingrediente.getAlertaEnviada()
                && ingrediente.getStockActual().compareTo(ingrediente.getUmbralAlerta()) < 0;

        if (cruzoumbAlerta) {
            ingrediente.setAlertaEnviada(true);
            ingredienteRepository.save(ingrediente);
        }

        return cruzoumbAlerta;
    }

    @Transactional
    public boolean resetearAlertaSiStockSuficiente(UUID ingredienteId) {
        Ingrediente ingrediente = ingredienteRepository.findById(ingredienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado: " + ingredienteId));

        boolean stockRecuperado = ingrediente.getStockActual().compareTo(ingrediente.getUmbralAlerta()) >= 0;

        if (stockRecuperado && Boolean.TRUE.equals(ingrediente.getAlertaEnviada())) {
            ingrediente.setAlertaEnviada(false);
            ingredienteRepository.save(ingrediente);
            publicarEventoStockRecuperado(ingrediente);
            return true;
        }

        return false;
    }

    public void verificarYResetearAlertasPorPlato(UUID platoId) {
        Escandallo escandallo = escandalloRepository.findByPlatoId(platoId)
                .orElse(null);

        if (escandallo == null || escandallo.getDetalles() == null) {
            return;
        }

        for (EscandalloDetalle detalle : escandallo.getDetalles()) {
            resetearAlertaSiStockSuficiente(detalle.getIngrediente().getId());
        }
    }

    public Ingrediente obtenerEntidad(UUID id) {
        return ingredienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado: " + id));
    }
}
