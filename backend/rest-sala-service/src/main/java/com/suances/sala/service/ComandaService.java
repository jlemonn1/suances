package com.suances.sala.service;

import com.suances.sala.domain.dto.request.ComandaRequest;
import com.suances.sala.domain.dto.response.ComandaResponse;
import com.suances.sala.domain.model.Comanda;
import com.suances.sala.domain.model.enums.ComandaEstado;
import com.suances.sala.event.SalaEventProducer;
import com.suances.sala.exception.BusinessRuleException;
import com.suances.sala.exception.ResourceNotFoundException;
import com.suances.sala.repository.ComandaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class ComandaService {

    private final ComandaRepository comandaRepository;
    private final MesaOperativaService mesaOperativaService;
    private final SalaEventProducer eventProducer;

    public ComandaService(ComandaRepository comandaRepository, 
                          MesaOperativaService mesaOperativaService,
                          SalaEventProducer eventProducer) {
        this.comandaRepository = comandaRepository;
        this.mesaOperativaService = mesaOperativaService;
        this.eventProducer = eventProducer;
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
        
        // Publicar evento
        eventProducer.publicarComandaAbierta(saved);
        
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ComandaResponse obtenerComanda(UUID id) {
        Comanda comanda = comandaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada: " + id));
        return mapToResponse(comanda);
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
