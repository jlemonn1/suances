package com.suances.sala.client.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class PlatoResponseDto {

    private UUID id;
    private String nombre;
    private String descripcion;
    private BigDecimal precioVenta;
    private Long contadorPedidos;
    private Boolean activo;
    private CategoriaDto categoria;
    private List<ImagenDto> imagenes;

    public static class CategoriaDto {
        private UUID id;
        private String nombre;

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
    }

    public static class ImagenDto {
        private UUID id;
        private String url;
        private Integer orden;

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public Integer getOrden() { return orden; }
        public void setOrden(Integer orden) { this.orden = orden; }
    }

    // Getters y Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public BigDecimal getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(BigDecimal precioVenta) { this.precioVenta = precioVenta; }
    public Long getContadorPedidos() { return contadorPedidos; }
    public void setContadorPedidos(Long contadorPedidos) { this.contadorPedidos = contadorPedidos; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public CategoriaDto getCategoria() { return categoria; }
    public void setCategoria(CategoriaDto categoria) { this.categoria = categoria; }
    public List<ImagenDto> getImagenes() { return imagenes; }
    public void setImagenes(List<ImagenDto> imagenes) { this.imagenes = imagenes; }
}
