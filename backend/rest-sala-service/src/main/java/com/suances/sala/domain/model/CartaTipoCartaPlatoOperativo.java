package com.suances.sala.domain.model;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "carta_tipo_carta_platos")
@IdClass(CartaTipoCartaPlatoOperativoId.class)
public class CartaTipoCartaPlatoOperativo {

    @Id
    @Column(name = "tipo_carta_id", nullable = false)
    private UUID tipoCartaId;

    @Id
    @Column(name = "plato_id", nullable = false)
    private UUID platoId;

    @Column(name = "orden")
    private Integer orden;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = OffsetDateTime.now();
    }

    // Getters y Setters
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

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
