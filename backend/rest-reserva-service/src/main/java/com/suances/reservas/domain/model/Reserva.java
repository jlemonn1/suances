package com.suances.reservas.domain.model;

import com.suances.reservas.domain.model.enums.ReservaEstado;
import com.suances.reservas.domain.model.enums.ReservaOrigen;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 12)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mesa_id")
    private Mesa mesa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "franja_id")
    private FranjaHoraria franja;

    @Column(nullable = false)
    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservaEstado estado = ReservaEstado.PENDIENTE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservaOrigen origen;

    @Column(name = "nombre_cliente", nullable = false, length = 120)
    private String nombreCliente;

    @Column(nullable = false, length = 30)
    private String telefono;

    private String email;

    @Column(nullable = false)
    private Short comensales;

    private String notas;

    @Column(name = "confirmacion_token", length = 64)
    private String confirmacionToken;

    @Column(name = "confirmacion_expira_at")
    private OffsetDateTime confirmacionExpiraAt;

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

    public String getCodigo() { return codigo; }

    public void setCodigo(String codigo) { this.codigo = codigo; }

    public Mesa getMesa() { return mesa; }

    public void setMesa(Mesa mesa) { this.mesa = mesa; }

    public FranjaHoraria getFranja() { return franja; }

    public void setFranja(FranjaHoraria franja) { this.franja = franja; }

    public LocalDate getFecha() { return fecha; }

    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public ReservaEstado getEstado() { return estado; }

    public void setEstado(ReservaEstado estado) { this.estado = estado; }

    public ReservaOrigen getOrigen() { return origen; }

    public void setOrigen(ReservaOrigen origen) { this.origen = origen; }

    public String getNombreCliente() { return nombreCliente; }

    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public String getTelefono() { return telefono; }

    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    public Short getComensales() { return comensales; }

    public void setComensales(Short comensales) { this.comensales = comensales; }

    public String getNotas() { return notas; }

    public void setNotas(String notas) { this.notas = notas; }

    public String getConfirmacionToken() { return confirmacionToken; }

    public void setConfirmacionToken(String confirmacionToken) { this.confirmacionToken = confirmacionToken; }

    public OffsetDateTime getConfirmacionExpiraAt() { return confirmacionExpiraAt; }

    public void setConfirmacionExpiraAt(OffsetDateTime confirmacionExpiraAt) { this.confirmacionExpiraAt = confirmacionExpiraAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
