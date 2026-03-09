package com.suances.sala.domain.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "carta_escandallos_operativos")
@IdClass(CartaEscandalloOperativoId.class)
public class CartaEscandalloOperativo {

    @Id
    @Column(name = "plato_id", nullable = false)
    private UUID platoId;

    @Id
    @Column(name = "ingrediente_id", nullable = false)
    private UUID ingredienteId;

    @Column(name = "cantidad_necesaria", nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidadNecesaria;

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

    public UUID getIngredienteId() {
        return ingredienteId;
    }

    public void setIngredienteId(UUID ingredienteId) {
        this.ingredienteId = ingredienteId;
    }

    public BigDecimal getCantidadNecesaria() {
        return cantidadNecesaria;
    }

    public void setCantidadNecesaria(BigDecimal cantidadNecesaria) {
        this.cantidadNecesaria = cantidadNecesaria;
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
