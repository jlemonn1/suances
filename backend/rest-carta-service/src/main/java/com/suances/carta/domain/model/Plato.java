package com.suances.carta.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "platos")
public class Plato {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal precioVenta;

    @Column(name = "contador_pedidos")
    private Long contadorPedidos = 0L;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "plato", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlatoImagen> imagenes = new ArrayList<>();

    @OneToOne(mappedBy = "plato", cascade = CascadeType.ALL, orphanRemoval = true)
    private Escandallo escandallo;

    @ManyToMany(mappedBy = "platos")
    private List<TipoCarta> tiposCarta = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public java.math.BigDecimal getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(java.math.BigDecimal precioVenta) { this.precioVenta = precioVenta; }
    public Long getContadorPedidos() { return contadorPedidos; }
    public void setContadorPedidos(Long contadorPedidos) { this.contadorPedidos = contadorPedidos; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<PlatoImagen> getImagenes() { return imagenes; }
    public void setImagenes(List<PlatoImagen> imagenes) { this.imagenes = imagenes; }
    public Escandallo getEscandallo() { return escandallo; }
    public void setEscandallo(Escandallo escandallo) { this.escandallo = escandallo; }
    public List<TipoCarta> getTiposCarta() { return tiposCarta; }
    public void setTiposCarta(List<TipoCarta> tiposCarta) { this.tiposCarta = tiposCarta; }
    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
}
