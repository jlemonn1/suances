package com.suances.caja.service;

import com.suances.caja.domain.dto.request.AbrirCajaRequest;
import com.suances.caja.domain.dto.response.SesionCajaResponse;
import com.suances.caja.domain.enums.EstadoSesion;
import com.suances.caja.domain.enums.MetodoPago;
import com.suances.caja.domain.model.ComandaCobrada;
import com.suances.caja.domain.model.SesionCaja;
import com.suances.caja.exception.BusinessRuleException;
import com.suances.caja.exception.ResourceNotFoundException;
import com.suances.caja.repository.SesionCajaRepository;
import com.suances.caja.repository.spec.SesionCajaSpec;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SesionCajaService {

    private final SesionCajaRepository sesionCajaRepository;

    public SesionCajaService(SesionCajaRepository sesionCajaRepository) {
        this.sesionCajaRepository = sesionCajaRepository;
    }

    @Transactional
    public SesionCajaResponse abrir(AbrirCajaRequest request, JwtAuthenticationToken jwt) {
        // RN-01: solo una sesión por día
        if (sesionCajaRepository.findByEstado(EstadoSesion.ABIERTA).isPresent()) {
            throw new BusinessRuleException("Ya existe una sesión de caja abierta hoy");
        }
        if (sesionCajaRepository.findByFecha(LocalDate.now()).isPresent()) {
            throw new BusinessRuleException("Ya existe una sesión de caja para hoy (cerrada). No se puede reabrir");
        }

        String userId = jwt.getToken().getSubject();
        String nombre = nombreDesdeJwt(jwt);

        SesionCaja sesion = new SesionCaja();
        sesion.setFecha(LocalDate.now());
        sesion.setDineroInicial(request.dineroInicial());
        sesion.setAbiertaPor(userId);
        sesion.setAbiertaPorNombre(nombre);

        return toResponse(sesionCajaRepository.save(sesion));
    }

    @Transactional
    public SesionCajaResponse cerrar(JwtAuthenticationToken jwt) {
        SesionCaja sesion = sesionCajaRepository.findByEstado(EstadoSesion.ABIERTA)
                .orElseThrow(() -> new ResourceNotFoundException("No hay sesión de caja abierta hoy"));

        List<ComandaCobrada> comandas = sesion.getComandas();

        BigDecimal sumEfectivo = sumar(comandas, MetodoPago.EFECTIVO);
        BigDecimal sumTarjeta  = sumar(comandas, MetodoPago.TARJETA);
        BigDecimal sumMesa     = sumar(comandas, MetodoPago.MESA);

        // RN-04: total_efectivo incluye dinero_inicial
        BigDecimal totalEfectivo = sesion.getDineroInicial().add(sumEfectivo);
        BigDecimal totalGeneral  = totalEfectivo.add(sumTarjeta).add(sumMesa);

        String userId = jwt.getToken().getSubject();
        String nombre = nombreDesdeJwt(jwt);

        sesion.setEstado(EstadoSesion.CERRADA);
        sesion.setCerradaPor(userId);
        sesion.setCerradaPorNombre(nombre);
        sesion.setCerradaAt(LocalDateTime.now());
        sesion.setTotalEfectivo(totalEfectivo);
        sesion.setTotalTarjeta(sumTarjeta);
        sesion.setTotalMesa(sumMesa);
        sesion.setTotalGeneral(totalGeneral);

        return toResponse(sesionCajaRepository.save(sesion));
    }

    @Transactional(readOnly = true)
    public SesionCajaResponse sesionActiva() {
        return sesionCajaRepository.findByEstado(EstadoSesion.ABIERTA)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No hay sesión de caja abierta"));
    }

    @Transactional(readOnly = true)
    public Page<SesionCajaResponse> listar(LocalDate fechaDesde, LocalDate fechaHasta,
                                           EstadoSesion estado, Pageable pageable) {
        return sesionCajaRepository
                .findAll(SesionCajaSpec.combinar(fechaDesde, fechaHasta, estado), pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public SesionCajaResponse detalle(UUID id) {
        return sesionCajaRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Sesión de caja no encontrada: " + id));
    }

    // --- helpers ---

    private BigDecimal sumar(List<ComandaCobrada> comandas, MetodoPago metodo) {
        return comandas.stream()
                .filter(c -> c.getMetodoPago() == metodo)
                .map(ComandaCobrada::getImporteTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String nombreDesdeJwt(JwtAuthenticationToken jwt) {
        String nombre = jwt.getToken().getClaimAsString("name");
        if (nombre == null) nombre = jwt.getToken().getClaimAsString("preferred_username");
        if (nombre == null) nombre = jwt.getToken().getSubject();
        return nombre;
    }

    private SesionCajaResponse toResponse(SesionCaja s) {
        return new SesionCajaResponse(
                s.getId(),
                s.getFecha(),
                s.getEstado(),
                s.getDineroInicial(),
                s.getAbiertaPor(),
                s.getAbiertaPorNombre(),
                s.getAbiertaAt(),
                s.getCerradaPor(),
                s.getCerradaPorNombre(),
                s.getCerradaAt(),
                s.getTotalEfectivo(),
                s.getTotalTarjeta(),
                s.getTotalMesa(),
                s.getTotalGeneral()
        );
    }
}
