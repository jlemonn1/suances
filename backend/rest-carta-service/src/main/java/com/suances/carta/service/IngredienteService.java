package com.suances.carta.service;

import com.suances.carta.domain.model.Categoria;
import com.suances.carta.domain.model.Distribuidor;
import com.suances.carta.domain.model.Escandallo;
import com.suances.carta.domain.model.EscandalloDetalle;
import com.suances.carta.domain.model.Ingrediente;
import com.suances.carta.dto.request.IngredienteRequest;
import com.suances.carta.dto.response.IngredienteResponse;
import com.suances.carta.exception.ResourceNotFoundException;
import com.suances.carta.repository.CategoriaRepository;
import com.suances.carta.repository.DistribuidorRepository;
import com.suances.carta.repository.EscandalloRepository;
import com.suances.carta.repository.IngredienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IngredienteService {

    private final IngredienteRepository ingredienteRepository;
    private final DistribuidorRepository distribuidorRepository;
    private final EscandalloRepository escandalloRepository;
    private final CategoriaRepository categoriaRepository;

    public IngredienteService(IngredienteRepository ingredienteRepository,
            DistribuidorRepository distribuidorRepository,
            EscandalloRepository escandalloRepository,
            CategoriaRepository categoriaRepository) {
        this.ingredienteRepository = ingredienteRepository;
        this.distribuidorRepository = distribuidorRepository;
        this.escandalloRepository = escandalloRepository;
        this.categoriaRepository = categoriaRepository;
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
        ingredienteRepository.save(ingrediente);
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

            ingrediente.setStockActual(stockNuevo);

            if (cruzoumbAlerta) {
                ingrediente.setAlertaEnviada(false);
            }

            ingredienteRepository.save(ingrediente);
        }

        verificarYResetearAlertasPorPlato(platoId);
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
