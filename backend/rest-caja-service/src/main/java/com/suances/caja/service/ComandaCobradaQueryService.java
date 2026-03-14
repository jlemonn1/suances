package com.suances.caja.service;

import com.suances.caja.domain.dto.response.ComandaCobradaDetalle;
import com.suances.caja.domain.dto.response.ComandaCobradaItemResponse;
import com.suances.caja.domain.dto.response.ComandaCobradaResumen;
import com.suances.caja.domain.enums.MetodoPago;
import com.suances.caja.domain.model.ComandaCobrada;
import com.suances.caja.exception.ResourceNotFoundException;
import com.suances.caja.repository.ComandaCobradaRepository;
import com.suances.caja.repository.spec.ComandaCobradaSpec;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class ComandaCobradaQueryService {

    private final ComandaCobradaRepository repository;

    public ComandaCobradaQueryService(ComandaCobradaRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Page<ComandaCobradaResumen> listar(
            LocalDate fecha,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            MetodoPago metodoPago,
            UUID sesionCajaId,
            String mesaNumero,
            Pageable pageable) {

        Specification<ComandaCobrada> spec = ComandaCobradaSpec.combinar(
                fecha, fechaDesde, fechaHasta, metodoPago, sesionCajaId, mesaNumero);

        return repository.findAll(spec, pageable).map(this::toResumen);
    }

    @Transactional(readOnly = true)
    public ComandaCobradaDetalle detalle(UUID id) {
        ComandaCobrada comanda = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda cobrada no encontrada: " + id));
        return toDetalle(comanda);
    }

    private ComandaCobradaResumen toResumen(ComandaCobrada c) {
        return new ComandaCobradaResumen(
                c.getId(),
                c.getSesionCaja().getId(),
                c.getComandaId(),
                c.getMesaNumero(),
                c.getMetodoPago(),
                c.getImporteTotal(),
                c.getCobradaAt()
        );
    }

    private ComandaCobradaDetalle toDetalle(ComandaCobrada c) {
        var items = c.getItems().stream()
                .map(i -> new ComandaCobradaItemResponse(
                        i.getPlatoId(),
                        i.getPlatoNombre(),
                        i.getCantidad(),
                        i.getPrecioUnitario(),
                        i.getSubtotal()
                ))
                .toList();

        return new ComandaCobradaDetalle(
                c.getId(),
                c.getSesionCaja().getId(),
                c.getComandaId(),
                c.getMesaNumero(),
                c.getMetodoPago(),
                c.getImporteTotal(),
                c.getCobradaAt(),
                c.getCreatedAt(),
                items
        );
    }
}
