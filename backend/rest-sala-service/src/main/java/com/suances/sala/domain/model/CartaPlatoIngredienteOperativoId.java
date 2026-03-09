package com.suances.sala.domain.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class CartaPlatoIngredienteOperativoId implements Serializable {

    private UUID platoId;
    private Integer ingredienteOrden;

    public CartaPlatoIngredienteOperativoId() {
    }

    public CartaPlatoIngredienteOperativoId(UUID platoId, Integer ingredienteOrden) {
        this.platoId = platoId;
        this.ingredienteOrden = ingredienteOrden;
    }

    public UUID getPlatoId() {
        return platoId;
    }

    public void setPlatoId(UUID platoId) {
        this.platoId = platoId;
    }

    public Integer getIngredienteOrden() {
        return ingredienteOrden;
    }

    public void setIngredienteOrden(Integer ingredienteOrden) {
        this.ingredienteOrden = ingredienteOrden;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartaPlatoIngredienteOperativoId that = (CartaPlatoIngredienteOperativoId) o;
        return Objects.equals(platoId, that.platoId) && Objects.equals(ingredienteOrden, that.ingredienteOrden);
    }

    @Override
    public int hashCode() {
        return Objects.hash(platoId, ingredienteOrden);
    }
}
