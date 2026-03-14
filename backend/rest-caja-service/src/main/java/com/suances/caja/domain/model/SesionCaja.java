package com.suances.caja.domain.model;

import com.suances.caja.domain.enums.EstadoSesion;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sesiones_caja")
public class SesionCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "fecha", nullable = false, unique = true)
    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoSesion estado = EstadoSesion.ABIERTA;

    @Column(name = "dinero_inicial", nullable = false, precision = 10, scale = 2)
    private BigDecimal dineroInicial;

    @Column(name = "abierta_por", nullable = false)
    private String abiertaPor;

    @Column(name = "abierta_por_nombre", nullable = false)
    private String abiertaPorNombre;

    @Column(name = "abierta_at", nullable = false, updatable = false)
    private LocalDateTime abiertaAt;

    @Column(name = "cerrada_por")
    private String cerradaPor;

    @Column(name = "cerrada_por_nombre")
    private String cerradaPorNombre;

    @Column(name = "cerrada_at")
    private LocalDateTime cerradaAt;

    @Column(name = "total_efectivo", precision = 10, scale = 2)
    private BigDecimal totalEfectivo;

    @Column(name = "total_tarjeta", precision = 10, scale = 2)
    private BigDecimal totalTarjeta;

    @Column(name = "total_mesa", precision = 10, scale = 2)
    private BigDecimal totalMesa;

    @Column(name = "total_general", precision = 10, scale = 2)
    private BigDecimal totalGeneral;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "sesionCaja", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComandaCobrada> comandas = new ArrayList<>();

    @PrePersist
    private void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.abiertaAt = now;
        if (this.fecha == null) {
            this.fecha = LocalDate.now();
        }
    }

    // --- Getters & Setters ---

    public UUID getId() { return id; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public EstadoSesion getEstado() { return estado; }
    public void setEstado(EstadoSesion estado) { this.estado = estado; }

    public BigDecimal getDineroInicial() { return dineroInicial; }
    public void setDineroInicial(BigDecimal dineroInicial) { this.dineroInicial = dineroInicial; }

    public String getAbiertaPor() { return abiertaPor; }
    public void setAbiertaPor(String abiertaPor) { this.abiertaPor = abiertaPor; }

    public String getAbiertaPorNombre() { return abiertaPorNombre; }
    public void setAbiertaPorNombre(String abiertaPorNombre) { this.abiertaPorNombre = abiertaPorNombre; }

    public LocalDateTime getAbiertaAt() { return abiertaAt; }

    public String getCerradaPor() { return cerradaPor; }
    public void setCerradaPor(String cerradaPor) { this.cerradaPor = cerradaPor; }

    public String getCerradaPorNombre() { return cerradaPorNombre; }
    public void setCerradaPorNombre(String cerradaPorNombre) { this.cerradaPorNombre = cerradaPorNombre; }

    public LocalDateTime getCerradaAt() { return cerradaAt; }
    public void setCerradaAt(LocalDateTime cerradaAt) { this.cerradaAt = cerradaAt; }

    public BigDecimal getTotalEfectivo() { return totalEfectivo; }
    public void setTotalEfectivo(BigDecimal totalEfectivo) { this.totalEfectivo = totalEfectivo; }

    public BigDecimal getTotalTarjeta() { return totalTarjeta; }
    public void setTotalTarjeta(BigDecimal totalTarjeta) { this.totalTarjeta = totalTarjeta; }

    public BigDecimal getTotalMesa() { return totalMesa; }
    public void setTotalMesa(BigDecimal totalMesa) { this.totalMesa = totalMesa; }

    public BigDecimal getTotalGeneral() { return totalGeneral; }
    public void setTotalGeneral(BigDecimal totalGeneral) { this.totalGeneral = totalGeneral; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public List<ComandaCobrada> getComandas() { return comandas; }
    public void setComandas(List<ComandaCobrada> comandas) { this.comandas = comandas; }
}
