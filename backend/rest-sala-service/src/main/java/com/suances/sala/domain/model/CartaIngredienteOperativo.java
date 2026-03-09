package com.suances.sala.domain.model;

import com.suances.sala.domain.model.enums.UnidadMedida;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "carta_ingredientes_operativos")
public class CartaIngredienteOperativo {

    @Id
    @Column(name = "ingrediente_id")
    private UUID ingredienteId;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidad_medida", nullable = false)
    private UnidadMedida unidadMedida;

    @Column(name = "stock_actual", precision = 10, scale = 2)
    private BigDecimal stockActual;

    @Column(name = "umbral_alerta", precision = 10, scale = 2)
    private BigDecimal umbralAlerta;

    @Column(name = "alerta_activa")
    private Boolean alertaActiva = false;

    @Column(name = "fecha_sincronizacion", nullable = false)
    private OffsetDateTime fechaSincronizacion;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void prePersist() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = this.createdAt;
        this.fechaSincronizacion = this.createdAt;
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // Getters y Setters
    public UUID getIngredienteId() {
        return ingredienteId;
    }

    public void setIngredienteId(UUID ingredienteId) {
        this.ingredienteId = ingredienteId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public UnidadMedida getUnidadMedida() {
        return unidadMedida;
    }

    public void setUnidadMedida(UnidadMedida unidadMedida) {
        this.unidadMedida = unidadMedida;
    }

    public BigDecimal getStockActual() {
        return stockActual;
    }

    public void setStockActual(BigDecimal stockActual) {
        this.stockActual = stockActual;
    }

    public BigDecimal getUmbralAlerta() {
        return umbralAlerta;
    }

    public void setUmbralAlerta(BigDecimal umbralAlerta) {
        this.umbralAlerta = umbralAlerta;
    }

    public Boolean getAlertaActiva() {
        return alertaActiva;
    }

    public void setAlertaActiva(Boolean alertaActiva) {
        this.alertaActiva = alertaActiva;
    }

    public OffsetDateTime getFechaSincronizacion() {
        return fechaSincronizacion;
    }

    public void setFechaSincronizacion(OffsetDateTime fechaSincronizacion) {
        this.fechaSincronizacion = fechaSincronizacion;
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
