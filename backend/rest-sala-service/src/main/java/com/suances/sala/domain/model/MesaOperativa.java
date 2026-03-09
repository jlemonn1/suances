package com.suances.sala.domain.model;

import com.suances.sala.domain.model.enums.MesaEstadoOperativo;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "mesas_operativas")
public class MesaOperativa {

    @Id
    private UUID id;

    @Column(nullable = false)
    private Integer numero;

    @Column(nullable = false)
    private Short capacidad;

    @Column(name = "sala_id", nullable = false)
    private UUID salaId;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_operativo", nullable = false)
    private MesaEstadoOperativo estadoOperativo = MesaEstadoOperativo.LIBRE;

    @Column(name = "comanda_activa_id")
    private UUID comandaActivaId;

    @Column(name = "camarero_asignado_id")
    private UUID camareroAsignadoId;

    @Column(name = "reserva_actual_id")
    private UUID reservaActualId;

    @Column(name = "nombre_cliente_reserva")
    private String nombreClienteReserva;

    @Column(name = "franja_id_reserva")
    private UUID franjaIdReserva;

    @Column(name = "fecha_reserva")
    private LocalDate fechaReserva;

    @Column(name = "ultima_actualizacion", nullable = false)
    private OffsetDateTime ultimaActualizacion;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void prePersist() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = this.createdAt;
        this.ultimaActualizacion = this.createdAt;
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
        this.ultimaActualizacion = this.updatedAt;
    }

    // Getters y Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public Short getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(Short capacidad) {
        this.capacidad = capacidad;
    }

    public UUID getSalaId() {
        return salaId;
    }

    public void setSalaId(UUID salaId) {
        this.salaId = salaId;
    }

    public MesaEstadoOperativo getEstadoOperativo() {
        return estadoOperativo;
    }

    public void setEstadoOperativo(MesaEstadoOperativo estadoOperativo) {
        this.estadoOperativo = estadoOperativo;
    }

    public UUID getComandaActivaId() {
        return comandaActivaId;
    }

    public void setComandaActivaId(UUID comandaActivaId) {
        this.comandaActivaId = comandaActivaId;
    }

    public UUID getCamareroAsignadoId() {
        return camareroAsignadoId;
    }

    public void setCamareroAsignadoId(UUID camareroAsignadoId) {
        this.camareroAsignadoId = camareroAsignadoId;
    }

    public UUID getReservaActualId() {
        return reservaActualId;
    }

    public void setReservaActualId(UUID reservaActualId) {
        this.reservaActualId = reservaActualId;
    }

    public String getNombreClienteReserva() {
        return nombreClienteReserva;
    }

    public void setNombreClienteReserva(String nombreClienteReserva) {
        this.nombreClienteReserva = nombreClienteReserva;
    }

    public UUID getFranjaIdReserva() {
        return franjaIdReserva;
    }

    public void setFranjaIdReserva(UUID franjaIdReserva) {
        this.franjaIdReserva = franjaIdReserva;
    }

    public LocalDate getFechaReserva() {
        return fechaReserva;
    }

    public void setFechaReserva(LocalDate fechaReserva) {
        this.fechaReserva = fechaReserva;
    }

    public OffsetDateTime getUltimaActualizacion() {
        return ultimaActualizacion;
    }

    public void setUltimaActualizacion(OffsetDateTime ultimaActualizacion) {
        this.ultimaActualizacion = ultimaActualizacion;
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
