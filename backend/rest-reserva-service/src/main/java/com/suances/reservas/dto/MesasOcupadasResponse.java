package com.suances.reservas.dto;

import java.util.List;
import java.util.UUID;

public record MesasOcupadasResponse(
        List<UUID> mesaIds
) {}
