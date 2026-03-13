package com.suances.sala.service;

import com.suances.sala.domain.dto.response.MesaOperativaResponse;
import com.suances.sala.domain.model.Comanda;
import com.suances.sala.domain.model.FranjaOperativa;
import com.suances.sala.domain.model.MesaOperativa;
import com.suances.sala.domain.model.SalaOperativa;
import com.suances.sala.domain.model.enums.MesaEstadoOperativo;
import com.suances.sala.exception.ResourceNotFoundException;
import com.suances.sala.repository.ComandaRepository;
import com.suances.sala.repository.FranjaOperativaRepository;
import com.suances.sala.repository.MesaOperativaRepository;
import com.suances.sala.repository.SalaOperativaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MesaOperativaService {

    private static final Logger log = LoggerFactory.getLogger(MesaOperativaService.class);

    private final MesaOperativaRepository mesaOperativaRepository;
    private final SalaOperativaRepository salaOperativaRepository;
    private final FranjaOperativaRepository franjaOperativaRepository;
    private final ComandaRepository comandaRepository;

    public MesaOperativaService(MesaOperativaRepository mesaOperativaRepository,
                                SalaOperativaRepository salaOperativaRepository,
                                FranjaOperativaRepository franjaOperativaRepository,
                                ComandaRepository comandaRepository) {
        this.mesaOperativaRepository = mesaOperativaRepository;
        this.salaOperativaRepository = salaOperativaRepository;
        this.franjaOperativaRepository = franjaOperativaRepository;
        this.comandaRepository = comandaRepository;
    }

    @Transactional
    public void sincronizarMesa(UUID mesaId, Integer numero, UUID salaId) {
        MesaOperativa mesa = mesaOperativaRepository.findById(mesaId)
                .orElse(new MesaOperativa());

        mesa.setId(mesaId);
        mesa.setNumero(numero);
        mesa.setSalaId(salaId);

        if (mesa.getEstadoOperativo() == null) {
            mesa.setEstadoOperativo(MesaEstadoOperativo.LIBRE);
        }

        mesaOperativaRepository.save(mesa);
    }

    @Transactional
    public void actualizarEstadoMesa(UUID mesaId, MesaEstadoOperativo nuevoEstado, UUID comandaId) {
        MesaOperativa mesa = mesaOperativaRepository.findById(mesaId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada: " + mesaId));

        log.info("[MesaOperativaService] Actualizando mesa {} de estado {} a estado {}", 
                mesaId, mesa.getEstadoOperativo(), nuevoEstado);

        mesa.setEstadoOperativo(nuevoEstado);
        mesa.setComandaActivaId(comandaId);

        // Si la mesa se libera, limpiar comanda activa
        if (nuevoEstado == MesaEstadoOperativo.LIBRE) {
            mesa.setComandaActivaId(null);
        }

        // Guardar y forzar flush para asegurar que los cambios se persisten inmediatamente
        MesaOperativa saved = mesaOperativaRepository.saveAndFlush(mesa);
        log.info("[MesaOperativaService] Mesa {} guardada con estado {} y comanda {}", 
                saved.getId(), saved.getEstadoOperativo(), saved.getComandaActivaId());
    }

    @Transactional
    public void asignarCamarero(UUID mesaId, UUID camareroId) {
        MesaOperativa mesa = mesaOperativaRepository.findById(mesaId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada: " + mesaId));

        mesa.setCamareroAsignadoId(camareroId);
        mesaOperativaRepository.save(mesa);
    }

    @Transactional
    public void actualizarReserva(UUID mesaId, UUID reservaId, String nombreCliente) {
        MesaOperativa mesa = mesaOperativaRepository.findById(mesaId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada: " + mesaId));

        mesa.setReservaActualId(reservaId);
        mesa.setNombreClienteReserva(nombreCliente);
        mesaOperativaRepository.save(mesa);
    }

    @Transactional
    public void limpiarReserva(UUID mesaId) {
        MesaOperativa mesa = mesaOperativaRepository.findById(mesaId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada: " + mesaId));

        mesa.setReservaActualId(null);
        mesa.setNombreClienteReserva(null);
        mesaOperativaRepository.save(mesa);
    }

    @Transactional(readOnly = true)
    public List<MesaOperativaResponse> listarMesas(UUID salaId, MesaEstadoOperativo estado, UUID franjaId) {
        List<MesaOperativa> mesas;

        if (salaId != null && estado != null) {
            mesas = mesaOperativaRepository.findBySalaIdAndEstadoOperativo(salaId, estado);
        } else if (salaId != null) {
            mesas = mesaOperativaRepository.findBySalaId(salaId);
        } else if (estado != null) {
            mesas = mesaOperativaRepository.findByEstadoOperativo(estado);
        } else {
            mesas = mesaOperativaRepository.findAll();
        }

        // Mapear todas las mesas, pero ajustar la info de reserva según la franja
        return mesas.stream()
                .map(mesa -> {
                    // Refrescar la entidad para asegurar que tenemos los datos más recientes
                    MesaOperativa refreshed = mesaOperativaRepository.findById(mesa.getId())
                            .orElse(mesa);
                    return mapToResponse(refreshed, franjaId);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public MesaOperativaResponse obtenerMesa(UUID mesaId) {
        MesaOperativa mesa = mesaOperativaRepository.findById(mesaId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada: " + mesaId));
        return mapToResponse(mesa, null);
    }

    @Transactional(readOnly = true)
    public MesaOperativaResponse obtenerMesaPorComanda(UUID comandaId) {
        MesaOperativa mesa = mesaOperativaRepository.findByComandaActivaId(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró mesa para la comanda: " + comandaId));
        return mapToResponse(mesa, null);
    }

    private MesaOperativaResponse mapToResponse(MesaOperativa mesa, UUID franjaId) {
        // Obtener nombre real de la sala
        String nombreSala = "Sala";
        if (mesa.getSalaId() != null) {
            nombreSala = salaOperativaRepository.findById(mesa.getSalaId())
                    .map(SalaOperativa::getNombre)
                    .orElse("Sala " + mesa.getSalaId().toString().substring(0, 4));
        }
        
        // TODO: Obtener nombre real del camarero desde servicio de usuarios
        String nombreCamarero = mesa.getCamareroAsignadoId() != null ? "Camarero " + mesa.getCamareroAsignadoId().toString().substring(0, 4) : null;

        // Verificar si la reserva es para hoy
        LocalDate hoy = LocalDate.now();
        boolean esReservaHoy = mesa.getFechaReserva() != null && mesa.getFechaReserva().equals(hoy);
        
        // Si hay franjaId y la mesa tiene reserva en OTRA franja, o la reserva no es de hoy, no mostrar la reserva
        UUID reservaActualId = mesa.getReservaActualId();
        String nombreClienteReserva = mesa.getNombreClienteReserva();
        UUID franjaIdReserva = mesa.getFranjaIdReserva();
        LocalDate fechaReserva = mesa.getFechaReserva();
        
        if (!esReservaHoy || (franjaId != null && franjaIdReserva != null && !franjaId.equals(franjaIdReserva))) {
            // La reserva no es de hoy o es para otra franja, no mostrarla
            reservaActualId = null;
            nombreClienteReserva = null;
            franjaIdReserva = null;
            fechaReserva = null;
        }

        // Obtener código de comanda si existe
        String codigoComanda = null;
        if (mesa.getComandaActivaId() != null) {
            Optional<Comanda> comandaOpt = comandaRepository.findById(mesa.getComandaActivaId());
            if (comandaOpt.isPresent()) {
                codigoComanda = comandaOpt.get().getCodigo();
            }
        }

        log.debug("[MesaOperativaService] Mapeando mesa {} - Estado: {}, ComandaActivaId: {}, Codigo: {}",
                mesa.getNumero(), mesa.getEstadoOperativo(), mesa.getComandaActivaId(), codigoComanda);

        return new MesaOperativaResponse(
                mesa.getId(),
                mesa.getNumero(),
                mesa.getSalaId(),
                nombreSala,
                mesa.getCapacidad(),
                mesa.getEstadoOperativo(),
                mesa.getComandaActivaId(),
                codigoComanda,
                mesa.getCamareroAsignadoId(),
                nombreCamarero,
                reservaActualId,
                nombreClienteReserva,
                franjaIdReserva,
                fechaReserva
        );
    }
    
    /**
     * Obtiene el ID de la franja operativa actual según la hora del día.
     * Busca entre las franjas activas del día actual.
     * 
     * @return Optional con el ID de la franja actual, o empty si no hay franja activa
     */
    @Transactional(readOnly = true)
    public Optional<UUID> getFranjaIdActual() {
        LocalTime ahora = LocalTime.now();
        LocalDate hoy = LocalDate.now();
        
        List<FranjaOperativa> franjasActivas = franjaOperativaRepository.findByActivaTrue().stream()
                .filter(f -> f.getFechaSincronizacion().equals(hoy))
                .toList();
        
        return franjasActivas.stream()
                .filter(f -> !ahora.isBefore(f.getHoraInicio()) && !ahora.isAfter(f.getHoraFin()))
                .findFirst()
                .map(FranjaOperativa::getId);
    }
}
