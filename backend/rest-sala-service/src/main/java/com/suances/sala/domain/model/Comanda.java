package com.suances.sala.domain.model;

import com.suances.sala.domain.model.enums.ComandaEstado;
import com.suances.sala.domain.model.enums.TipoRonda;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "comandas")
public class Comanda {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "mesa_id", nullable = false)
    private UUID mesaId;

    @Column(name = "camarero_id", nullable = false)
    private UUID camareroId;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComandaEstado estado = ComandaEstado.ABIERTA;

    @Column(name = "numero_comensales", nullable = false)
    private Integer numeroComensales = 1;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "descuento_porcentaje", nullable = false, precision = 5, scale = 2)
    private BigDecimal descuentoPorcentaje = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "ronda_actual")
    private TipoRonda rondaActual = TipoRonda.ENTRANTE;

    @Column(name = "ticket_impreso")
    private Boolean ticketImpreso = false;

    @Column(name = "fecha_apertura", nullable = false)
    private OffsetDateTime fechaApertura;

    @Column(name = "fecha_cierre")
    private OffsetDateTime fechaCierre;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void prePersist() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = this.createdAt;
        this.fechaApertura = this.createdAt;
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // Getters y Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getMesaId() {
        return mesaId;
    }

    public void setMesaId(UUID mesaId) {
        this.mesaId = mesaId;
    }

    public UUID getCamareroId() {
        return camareroId;
    }

    public void setCamareroId(UUID camareroId) {
        this.camareroId = camareroId;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public ComandaEstado getEstado() {
        return estado;
    }

    public void setEstado(ComandaEstado estado) {
        this.estado = estado;
    }

    public Integer getNumeroComensales() {
        return numeroComensales;
    }

    public void setNumeroComensales(Integer numeroComensales) {
        this.numeroComensales = numeroComensales;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public BigDecimal getDescuentoPorcentaje() {
        return descuentoPorcentaje;
    }

    public void setDescuentoPorcentaje(BigDecimal descuentoPorcentaje) {
        this.descuentoPorcentaje = descuentoPorcentaje;
    }

    public OffsetDateTime getFechaApertura() {
        return fechaApertura;
    }

    public void setFechaApertura(OffsetDateTime fechaApertura) {
        this.fechaApertura = fechaApertura;
    }

    public OffsetDateTime getFechaCierre() {
        return fechaCierre;
    }

    public void setFechaCierre(OffsetDateTime fechaCierre) {
        this.fechaCierre = fechaCierre;
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

    public TipoRonda getRondaActual() {
        return rondaActual;
    }

    public void setRondaActual(TipoRonda rondaActual) {
        this.rondaActual = rondaActual;
    }

    public Boolean getTicketImpreso() {
        return ticketImpreso;
    }

    public void setTicketImpreso(Boolean ticketImpreso) {
        this.ticketImpreso = ticketImpreso;
    }
}
