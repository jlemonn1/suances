package com.suances.sala.domain.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "carta_plato_ingredientes_operativos")
@IdClass(CartaPlatoIngredienteOperativoId.class)
public class CartaPlatoIngredienteOperativo {

    @Id
    @Column(name = "plato_id", nullable = false)
    private UUID platoId;

    @Id
    @Column(name = "ingrediente_orden")
    private Integer ingredienteOrden;

    @Column(name = "ingrediente_nombre", nullable = false, length = 200)
    private String ingredienteNombre;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void prePersist() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // Getters y Setters
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

    public String getIngredienteNombre() {
        return ingredienteNombre;
    }

    public void setIngredienteNombre(String ingredienteNombre) {
        this.ingredienteNombre = ingredienteNombre;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
