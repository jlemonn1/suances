package com.suances.reservas.service;

import com.suances.reservas.domain.model.WaitlistEntry;
import com.suances.reservas.domain.model.enums.WaitlistEstado;
import com.suances.reservas.dto.WaitlistResponse;
import com.suances.reservas.exception.ResourceNotFoundException;
import com.suances.reservas.repository.WaitlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class WaitlistService {

    private final WaitlistRepository waitlistRepository;

    public WaitlistService(WaitlistRepository waitlistRepository) {
        this.waitlistRepository = waitlistRepository;
    }

    @Transactional(readOnly = true)
    public List<WaitlistResponse> listar(LocalDate fecha, UUID franjaId) {
        return waitlistRepository
                .findByFechaAndFranja_IdAndEstadoOrderByPrioridadAsc(fecha, franjaId, WaitlistEstado.WAITING)
                .stream()
                .map(this::map)
                .toList();
    }

    @Transactional
    public WaitlistResponse actualizarEstado(UUID entryId, WaitlistEstado estado) {
        WaitlistEntry entry = waitlistRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Entrada de waitlist no encontrada"));
        entry.setEstado(estado);
        return map(entry);
    }

    private WaitlistResponse map(WaitlistEntry entry) {
        return new WaitlistResponse(
                entry.getId(),
                entry.getFecha(),
                entry.getFranja().getId(),
                entry.getComensales(),
                entry.getNombreCliente(),
                entry.getTelefono(),
                entry.getPrioridad(),
                entry.getEstado());
    }
}
