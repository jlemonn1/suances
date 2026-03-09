package com.suances.sala.client.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class PlatoSyncDto {

    private UUID id;
    private String nombre;
    private String descripcion;
    private BigDecimal precioVenta;
    private UUID categoriaId;
    private String categoriaNombre;
    private Boolean activo;
    private Integer contadorPedidos;
    private List<PlatoImagenSyncDto> imagenes;

    // Getters y Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Integer getContadorPedidos() {
        return contadorPedidos;
    }

    public void setContadorPedidos(Integer contadorPedidos) {
        this.contadorPedidos = contadorPedidos;
    }

    public List<PlatoImagenSyncDto> getImagenes() {
        return imagenes;
    }

    public void setImagenes(List<PlatoImagenSyncDto> imagenes) {
        this.imagenes = imagenes;
    }
}
