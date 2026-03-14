package com.suances.caja.domain.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "comandas_cobradas_items")
public class ComandaCobradaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comanda_cobrada_id", nullable = false)
    private ComandaCobrada comandaCobrada;

    @Column(name = "plato_id", nullable = false)
    private UUID platoId;

    @Column(name = "plato_nombre", nullable = false)
    private String platoNombre;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    // --- Getters & Setters ---

    public UUID getId() { return id; }

    public ComandaCobrada getComandaCobrada() { return comandaCobrada; }
    public void setComandaCobrada(ComandaCobrada comandaCobrada) { this.comandaCobrada = comandaCobrada; }

    public UUID getPlatoId() { return platoId; }
    public void setPlatoId(UUID platoId) { this.platoId = platoId; }

    public String getPlatoNombre() { return platoNombre; }
    public void setPlatoNombre(String platoNombre) { this.platoNombre = platoNombre; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}
