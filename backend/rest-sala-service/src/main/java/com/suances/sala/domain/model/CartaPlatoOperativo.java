package com.suances.sala.domain.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "carta_platos_operativos")
public class CartaPlatoOperativo {

    @Id
    @Column(name = "plato_id")
    private UUID platoId;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @Column(name = "categoria_id")
    private UUID categoriaId;

    @Column(name = "categoria_nombre", length = 100)
    private String categoriaNombre;

    @Column(name = "stock_disponible", precision = 10, scale = 2)
    private BigDecimal stockDisponible;

    @Column(nullable = false)
    private Boolean disponible = true;

    @Column(name = "contador_pedidos_local")
    private Integer contadorPedidosLocal = 0;

    @Column(name = "stock_bajo")
    private Boolean stockBajo = false;

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    @Column(name = "fecha_sincronizacion", nullable = false)
    private OffsetDateTime fechaSincronizacion;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void prePersist() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = this.createdAt;
        this.fechaSincronizacion = this.createdAt;
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // Getters y Setters
    public UUID getPlatoId() {
        return platoId;
    }

    public void setPlatoId(UUID platoId) {
        this.platoId = platoId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimal getPrecioVenta() {
        return precioVenta;
    }

    public void setPrecioVenta(BigDecimal precioVenta) {
        this.precioVenta = precioVenta;
    }

    public UUID getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(UUID categoriaId) {
        this.categoriaId = categoriaId;
    }

    public String getCategoriaNombre() {
        return categoriaNombre;
    }

    public void setCategoriaNombre(String categoriaNombre) {
        this.categoriaNombre = categoriaNombre;
    }

    public BigDecimal getStockDisponible() {
        return stockDisponible;
    }

    public void setStockDisponible(BigDecimal stockDisponible) {
        this.stockDisponible = stockDisponible;
    }

    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }

    public Integer getContadorPedidosLocal() {
        return contadorPedidosLocal;
    }

    public void setContadorPedidosLocal(Integer contadorPedidosLocal) {
        this.contadorPedidosLocal = contadorPedidosLocal;
    }

    public Boolean getStockBajo() {
        return stockBajo;
    }

    public void setStockBajo(Boolean stockBajo) {
        this.stockBajo = stockBajo;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public OffsetDateTime getFechaSincronizacion() {
        return fechaSincronizacion;
    }

    public void setFechaSincronizacion(OffsetDateTime fechaSincronizacion) {
        this.fechaSincronizacion = fechaSincronizacion;
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
