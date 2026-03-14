package com.suances.caja.service;

import com.suances.caja.domain.dto.event.SalaComandaCobradaEventData;
import com.suances.caja.domain.enums.EstadoSesion;
import com.suances.caja.domain.enums.MetodoPago;
import com.suances.caja.domain.model.ComandaCobrada;
import com.suances.caja.domain.model.EventosProcesados;
import com.suances.caja.domain.model.SesionCaja;
import com.suances.caja.repository.ComandaCobradaRepository;
import com.suances.caja.repository.EventosProcesadosRepository;
import com.suances.caja.repository.SesionCajaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class ComandaCobradaService {

    private static final Logger log = LoggerFactory.getLogger(ComandaCobradaService.class);

    private final SesionCajaRepository sesionCajaRepository;
    private final ComandaCobradaRepository comandaCobradaRepository;
    private final EventosProcesadosRepository eventosProcesadosRepository;

    public ComandaCobradaService(SesionCajaRepository sesionCajaRepository,
                                 ComandaCobradaRepository comandaCobradaRepository,
                                 EventosProcesadosRepository eventosProcesadosRepository) {
        this.sesionCajaRepository = sesionCajaRepository;
        this.comandaCobradaRepository = comandaCobradaRepository;
        this.eventosProcesadosRepository = eventosProcesadosRepository;
    }

    /**
     * Procesa un evento sala.comanda.cobrada de forma idempotente.
     * @return true si se procesó correctamente (ACK), false si debe reintentarse (no ACK)
     */
    @Transactional
    public boolean procesarComandaCobrada(String eventId, SalaComandaCobradaEventData data) {
        // Idempotencia: si ya fue procesado, ACK sin hacer nada
        if (eventosProcesadosRepository.existsById(eventId)) {
            log.info("[Caja] Evento duplicado ignorado: {}", eventId);
            return true;
        }

        // Obtener o crear sesión de caja para hoy (D-01: crear automática si no hay)
        SesionCaja sesion = obtenerOCrearSesionAbierta();
        if (sesion == null) {
            log.error("[Caja] No se pudo obtener ni crear sesión de caja para evento: {}", eventId);
            return false;
        }

        // Persistir ComandaCobrada
        ComandaCobrada comanda = new ComandaCobrada();
        comanda.setSesionCaja(sesion);
        comanda.setEventId(eventId);
        comanda.setComandaId(UUID.fromString(data.getComandaId()));
        comanda.setMesaNumero(data.getMesaId());
        comanda.setMetodoPago(MetodoPago.valueOf(data.getTipoPago()));
        comanda.setImporteTotal(new BigDecimal(data.getTotal()));
        comanda.setCobradaAt(OffsetDateTime.parse(data.getHoraCobro()).toLocalDateTime());
        comandaCobradaRepository.save(comanda);

        // Registrar evento procesado
        EventosProcesados ep = new EventosProcesados();
        ep.setEventId(eventId);
        eventosProcesadosRepository.save(ep);

        log.info("[Caja] Comanda cobrada registrada: eventId={}, comanda={}, importe={}, metodo={}",
                eventId, data.getComandaId(), data.getTotal(), data.getTipoPago());
        return true;
    }

    private SesionCaja obtenerOCrearSesionAbierta() {
        return sesionCajaRepository.findByEstado(EstadoSesion.ABIERTA)
                .orElseGet(this::crearSesionAutomatica);
    }

    private SesionCaja crearSesionAutomatica() {
        // Verificar que no haya ya una sesión para hoy (puede existir cerrada)
        LocalDate hoy = LocalDate.now();
        if (sesionCajaRepository.findByFecha(hoy).isPresent()) {
            log.warn("[Caja] Ya existe una sesión cerrada para hoy {}. No se crea automática.", hoy);
            return null;
        }

        SesionCaja sesion = new SesionCaja();
        sesion.setFecha(hoy);
        sesion.setDineroInicial(BigDecimal.ZERO);
        sesion.setAbiertaPor("sistema");
        sesion.setAbiertaPorNombre("Sistema (auto)");
        SesionCaja saved = sesionCajaRepository.save(sesion);
        log.warn("[Caja] Sesión de caja creada automáticamente para {} con dinero_inicial=0", hoy);
        return saved;
    }
}
