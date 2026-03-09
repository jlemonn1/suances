package com.suances.sala.domain.model;

import jakarta.persistence.*;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "carta_tipos_carta_operativos")
public class CartaTipoCartaOperativo {

    @Id
    @Column(name = "tipo_carta_id")
    private UUID tipoCartaId;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "platos_ids", length = 2000)
    private String platosIds; // JSON array de UUIDs

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
    public UUID getTipoCartaId() {
        return tipoCartaId;
    }

    public void setTipoCartaId(UUID tipoCartaId) {
        this.tipoCartaId = tipoCartaId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public String getPlatosIds() {
        return platosIds;
    }

    public void setPlatosIds(String platosIds) {
        this.platosIds = platosIds;
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
