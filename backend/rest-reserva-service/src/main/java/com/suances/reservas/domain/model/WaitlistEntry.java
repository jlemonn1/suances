package com.suances.reservas.domain.model;

import com.suances.reservas.domain.model.enums.WaitlistEstado;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "waitlist")
public class WaitlistEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private LocalDate fecha;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "franja_id")
    private FranjaHoraria franja;

    @Column(nullable = false)
    private Short comensales;

    @Column(name = "nombre_cliente", nullable = false, length = 120)
    private String nombreCliente;

    @Column(nullable = false, length = 30)
    private String telefono;

    @Column(nullable = false)
    private Short prioridad = 10;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WaitlistEstado estado = WaitlistEstado.WAITING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id")
    private Reserva reserva;

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
    public UUID getId() { return id; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public FranjaHoraria getFranja() { return franja; }
    public void setFranja(FranjaHoraria franja) { this.franja = franja; }
    public Short getComensales() { return comensales; }
    public void setComensales(Short comensales) { this.comensales = comensales; }
    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public Short getPrioridad() { return prioridad; }
    public void setPrioridad(Short prioridad) { this.prioridad = prioridad; }
    public WaitlistEstado getEstado() { return estado; }
    public void setEstado(WaitlistEstado estado) { this.estado = estado; }
    public Reserva getReserva() { return reserva; }
    public void setReserva(Reserva reserva) { this.reserva = reserva; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
