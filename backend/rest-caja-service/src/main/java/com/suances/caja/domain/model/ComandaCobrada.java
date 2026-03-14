package com.suances.caja.domain.model;

import com.suances.caja.domain.enums.MetodoPago;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "comandas_cobradas")
public class ComandaCobrada {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sesion_caja_id", nullable = false)
    private SesionCaja sesionCaja;

    @Column(name = "event_id", nullable = false, unique = true)
    private String eventId;

    @Column(name = "comanda_id", nullable = false)
    private UUID comandaId;

    @Column(name = "mesa_numero", nullable = false)
    private String mesaNumero;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false)
    private MetodoPago metodoPago;

    @Column(name = "importe_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal importeTotal;

    @Column(name = "cobrada_at", nullable = false)
    private LocalDateTime cobradaAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "comandaCobrada", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComandaCobradaItem> items = new ArrayList<>();

    @PrePersist
    private void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // --- Getters & Setters ---

    public UUID getId() { return id; }

    public SesionCaja getSesionCaja() { return sesionCaja; }
    public void setSesionCaja(SesionCaja sesionCaja) { this.sesionCaja = sesionCaja; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public UUID getComandaId() { return comandaId; }
    public void setComandaId(UUID comandaId) { this.comandaId = comandaId; }

    public String getMesaNumero() { return mesaNumero; }
    public void setMesaNumero(String mesaNumero) { this.mesaNumero = mesaNumero; }

    public MetodoPago getMetodoPago() { return metodoPago; }
    public void setMetodoPago(MetodoPago metodoPago) { this.metodoPago = metodoPago; }

    public BigDecimal getImporteTotal() { return importeTotal; }
    public void setImporteTotal(BigDecimal importeTotal) { this.importeTotal = importeTotal; }

    public LocalDateTime getCobradaAt() { return cobradaAt; }
    public void setCobradaAt(LocalDateTime cobradaAt) { this.cobradaAt = cobradaAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public List<ComandaCobradaItem> getItems() { return items; }
    public void setItems(List<ComandaCobradaItem> items) { this.items = items; }
}
