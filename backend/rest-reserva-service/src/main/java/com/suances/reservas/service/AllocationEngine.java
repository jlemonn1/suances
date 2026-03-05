package com.suances.reservas.service;

import com.suances.reservas.domain.model.Mesa;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface AllocationEngine {

    Optional<Mesa> allocateMesa(LocalDate fecha, UUID franjaId, short comensales, boolean incluirBloqueadasOnline);
}
