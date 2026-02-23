package com.suances.carta.domain.model;

import com.suances.carta.domain.enums.UnidadMedida;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "ingredientes")
public class Ingrediente {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidad_medida", nullable = false)
    private UnidadMedida unidadMedida;

    @Column(name = "precio_por_unidad", nullable = false, precision = 10, scale = 4)
    private BigDecimal precioPorUnidad;

    @Column(name = "stock_actual", precision = 10, scale = 4)
    private BigDecimal stockActual = BigDecimal.ZERO;

    @Column(name = "umbral_alerta", nullable = false, precision = 10, scale = 4)
    private BigDecimal umbralAlerta;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "alerta_enviada")
    private Boolean alertaEnviada = false;

    @ManyToMany
    @JoinTable(
        name = "ingrediente_distribuidor",
        joinColumns = @JoinColumn(name = "ingrediente_id"),
        inverseJoinColumns = @JoinColumn(name = "distribuidor_id")
    )
    private Set<Distribuidor> distribuidores = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public UnidadMedida getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(UnidadMedida unidadMedida) { this.unidadMedida = unidadMedida; }
    public BigDecimal getPrecioPorUnidad() { return precioPorUnidad; }
    public void setPrecioPorUnidad(BigDecimal precioPorUnidad) { this.precioPorUnidad = precioPorUnidad; }
    public BigDecimal getStockActual() { return stockActual; }
    public void setStockActual(BigDecimal stockActual) { this.stockActual = stockActual; }
    public BigDecimal getUmbralAlerta() { return umbralAlerta; }
    public void setUmbralAlerta(BigDecimal umbralAlerta) { this.umbralAlerta = umbralAlerta; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Boolean getAlertaEnviada() { return alertaEnviada; }
    public void setAlertaEnviada(Boolean alertaEnviada) { this.alertaEnviada = alertaEnviada; }
    public Set<Distribuidor> getDistribuidores() { return distribuidores; }
    public void setDistribuidores(Set<Distribuidor> distribuidores) { this.distribuidores = distribuidores; }
}
