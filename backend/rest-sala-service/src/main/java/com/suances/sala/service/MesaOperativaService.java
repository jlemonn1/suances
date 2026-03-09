package com.suances.sala.service;

import com.suances.sala.domain.dto.response.MesaOperativaResponse;
import com.suances.sala.domain.model.MesaOperativa;
import com.suances.sala.domain.model.enums.MesaEstadoOperativo;
import com.suances.sala.exception.ResourceNotFoundException;
import com.suances.sala.repository.MesaOperativaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class MesaOperativaService {

    private final MesaOperativaRepository mesaOperativaRepository;

    public MesaOperativaService(MesaOperativaRepository mesaOperativaRepository) {
        this.mesaOperativaRepository = mesaOperativaRepository;
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

        mesa.setEstadoOperativo(nuevoEstado);
        mesa.setComandaActivaId(comandaId);

        // Si la mesa se libera, limpiar comanda activa
        if (nuevoEstado == MesaEstadoOperativo.LIBRE) {
            mesa.setComandaActivaId(null);
        }

        mesaOperativaRepository.save(mesa);
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
                .map(mesa -> mapToResponse(mesa, franjaId))
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
        // TODO: Obtener nombres reales desde otros servicios
        String nombreSala = "Sala " + (mesa.getSalaId() != null ? mesa.getSalaId().toString().substring(0, 4) : "N/A");
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

        return new MesaOperativaResponse(
                mesa.getId(),
                mesa.getNumero(),
                mesa.getSalaId(),
                nombreSala,
                mesa.getCapacidad(),
                mesa.getEstadoOperativo(),
                mesa.getComandaActivaId(),
                null, // Código de comanda - obtener desde comanda
                mesa.getCamareroAsignadoId(),
                nombreCamarero,
                reservaActualId,
                nombreClienteReserva,
                franjaIdReserva,
                fechaReserva
        );
    }
}
