package com.suances.reservas.domain.model;

import com.suances.reservas.domain.model.enums.BloqueoTipo;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "bloqueos")
public class Bloqueo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mesa_id")
    private Mesa mesa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloqueoTipo tipo;

    private String motivo;

    @Column(name = "fecha_desde", nullable = false)
    private LocalDate fechaDesde;

    @Column(name = "fecha_hasta", nullable = false)
    private LocalDate fechaHasta;

    @Column(columnDefinition = "jsonb")
    private String franjas;

    @Column(name = "creado_por")
    private UUID creadoPor;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }

    public Mesa getMesa() { return mesa; }

    public void setMesa(Mesa mesa) { this.mesa = mesa; }

    public BloqueoTipo getTipo() { return tipo; }

    public void setTipo(BloqueoTipo tipo) { this.tipo = tipo; }

    public String getMotivo() { return motivo; }

    public void setMotivo(String motivo) { this.motivo = motivo; }

    public LocalDate getFechaDesde() { return fechaDesde; }

    public void setFechaDesde(LocalDate fechaDesde) { this.fechaDesde = fechaDesde; }

    public LocalDate getFechaHasta() { return fechaHasta; }

    public void setFechaHasta(LocalDate fechaHasta) { this.fechaHasta = fechaHasta; }

    public String getFranjas() { return franjas; }

    public void setFranjas(String franjas) { this.franjas = franjas; }

    public UUID getCreadoPor() { return creadoPor; }

    public void setCreadoPor(UUID creadoPor) { this.creadoPor = creadoPor; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
}
