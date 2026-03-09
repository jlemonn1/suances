package com.suances.sala.domain.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class CartaTipoCartaPlatoOperativoId implements Serializable {

    private UUID tipoCartaId;
    private UUID platoId;

    public CartaTipoCartaPlatoOperativoId() {
    }

    public CartaTipoCartaPlatoOperativoId(UUID tipoCartaId, UUID platoId) {
        this.tipoCartaId = tipoCartaId;
        this.platoId = platoId;
    }

    public UUID getTipoCartaId() {
        return tipoCartaId;
    }

    public void setTipoCartaId(UUID tipoCartaId) {
        this.tipoCartaId = tipoCartaId;
    }

    public UUID getPlatoId() {
        return platoId;
    }

    public void setPlatoId(UUID platoId) {
        this.platoId = platoId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartaTipoCartaPlatoOperativoId that = (CartaTipoCartaPlatoOperativoId) o;
        return Objects.equals(tipoCartaId, that.tipoCartaId) && Objects.equals(platoId, that.platoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tipoCartaId, platoId);
    }
}
