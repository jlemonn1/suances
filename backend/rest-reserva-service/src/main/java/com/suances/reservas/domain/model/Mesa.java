package com.suances.reservas.domain.model;

import com.suances.reservas.domain.model.enums.MesaEstado;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "mesas")
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "sala_id")
    private Sala sala;

    @Column(nullable = false)
    private Integer numero;

    @Column(nullable = false)
    private Short capacidad;

    @Column(name = "pos_x")
    private Integer posX;

    @Column(name = "pos_y")
    private Integer posY;

    private Integer ancho;

    private Integer alto;

    @Column(name = "visible_online", nullable = false)
    private boolean visibleOnline = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MesaEstado estado = MesaEstado.LIBRE;

    @Column(nullable = false)
    private boolean activa = true;

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

    // getters y setters
    public UUID getId() {
        return id;
    }

    public Sala getSala() {
        return sala;
    }

    public void setSala(Sala sala) {
        this.sala = sala;
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

    public Integer getPosX() {
        return posX;
    }

    public void setPosX(Integer posX) {
        this.posX = posX;
    }

    public Integer getPosY() {
        return posY;
    }

    public void setPosY(Integer posY) {
        this.posY = posY;
    }

    public Integer getAncho() {
        return ancho;
    }

    public void setAncho(Integer ancho) {
        this.ancho = ancho;
    }

    public Integer getAlto() {
        return alto;
    }

    public void setAlto(Integer alto) {
        this.alto = alto;
    }

    public boolean isVisibleOnline() {
        return visibleOnline;
    }

    public void setVisibleOnline(boolean visibleOnline) {
        this.visibleOnline = visibleOnline;
    }

    public MesaEstado getEstado() {
        return estado;
    }

    public void setEstado(MesaEstado estado) {
        this.estado = estado;
    }

    public boolean isActiva() {
        return activa;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
