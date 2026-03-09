package com.suances.sala.event.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class PlatoUpdatedEvent {

    private String eventId;
    private UUID id;
    private String nombre;
    private String descripcion;
    private BigDecimal precioVenta;
    private UUID categoriaId;
    private String categoriaNombre;
    private Boolean activo;
    private String imagenUrl;
    private List<String> ingredientes;
    private List<TipoCartaInfo> tiposCarta;

    public static class TipoCartaInfo {
        private UUID id;
        private String nombre;

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
    }

    // Getters y Setters
    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

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

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public List<String> getIngredientes() {
        return ingredientes;
    }

    public void setIngredientes(List<String> ingredientes) {
        this.ingredientes = ingredientes;
    }

    public List<TipoCartaInfo> getTiposCarta() {
        return tiposCarta;
    }

    public void setTiposCarta(List<TipoCartaInfo> tiposCarta) {
        this.tiposCarta = tiposCarta;
    }
}
