package com.suances.carta.domain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "escandallo_detalles")
public class EscandalloDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escandallo_id", nullable = false)
    private Escandallo escandallo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingrediente_id", nullable = false)
    private Ingrediente ingrediente;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal cantidad;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Escandallo getEscandallo() { return escandallo; }
    public void setEscandallo(Escandallo escandallo) { this.escandallo = escandallo; }
    public Ingrediente getIngrediente() { return ingrediente; }
    public void setIngrediente(Ingrediente ingrediente) { this.ingrediente = ingrediente; }
    public BigDecimal getCantidad() { return cantidad; }
    public void setCantidad(BigDecimal cantidad) { this.cantidad = cantidad; }
}
