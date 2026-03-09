package com.suances.sala.domain.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class CartaEscandalloOperativoId implements Serializable {

    private UUID platoId;
    private UUID ingredienteId;

    public CartaEscandalloOperativoId() {
    }

    public CartaEscandalloOperativoId(UUID platoId, UUID ingredienteId) {
        this.platoId = platoId;
        this.ingredienteId = ingredienteId;
    }

    public UUID getPlatoId() {
        return platoId;
    }

    public void setPlatoId(UUID platoId) {
        this.platoId = platoId;
    }

    public UUID getIngredienteId() {
        return ingredienteId;
    }

    public void setIngredienteId(UUID ingredienteId) {
        this.ingredienteId = ingredienteId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartaEscandalloOperativoId that = (CartaEscandalloOperativoId) o;
        return Objects.equals(platoId, that.platoId) && Objects.equals(ingredienteId, that.ingredienteId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(platoId, ingredienteId);
    }
}
