package com.suances.carta.dto.request;

import java.util.List;
import java.util.UUID;

public class AsociarPlatosRequest {
    private List<UUID> platoIds;

    public List<UUID> getPlatoIds() {
        return platoIds;
    }

    public void setPlatoIds(List<UUID> platoIds) {
        this.platoIds = platoIds;
    }
}
