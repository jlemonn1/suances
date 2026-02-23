package com.suances.carta.domain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "escandallos")
public class Escandallo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plato_id", nullable = false, unique = true)
    private Plato plato;

    @Column(name = "nombre_version", nullable = false, length = 100)
    private String nombreVersion;

    @Column(name = "coste_total_snapshot", nullable = false, precision = 10, scale = 4)
    private BigDecimal costeTotalSnapshot = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "escandallo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EscandalloDetalle> detalles = new ArrayList<>();

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
    public Plato getPlato() { return plato; }
    public void setPlato(Plato plato) { this.plato = plato; }
    public String getNombreVersion() { return nombreVersion; }
    public void setNombreVersion(String nombreVersion) { this.nombreVersion = nombreVersion; }
    public BigDecimal getCosteTotalSnapshot() { return costeTotalSnapshot; }
    public void setCosteTotalSnapshot(BigDecimal costeTotalSnapshot) { this.costeTotalSnapshot = costeTotalSnapshot; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<EscandalloDetalle> getDetalles() { return detalles; }
    public void setDetalles(List<EscandalloDetalle> detalles) { this.detalles = detalles; }
}
