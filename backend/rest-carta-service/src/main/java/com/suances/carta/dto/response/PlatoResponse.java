package com.suances.carta.dto.response;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class PlatoResponse {

    private UUID id;
    private String nombre;
    private String descripcion;
    private BigDecimal precioVenta;
    private BigDecimal costeTotal;
    private BigDecimal margen;
    private Long contadorPedidos;
    private Boolean activo;
    private LocalDateTime createdAt;
    private List<ImagenResponse> imagenes;
    private CategoriaResponse categoria;
    private List<TipoCartaResponse> tiposCarta;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public BigDecimal getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(BigDecimal precioVenta) { this.precioVenta = precioVenta; }
    public BigDecimal getCosteTotal() { return costeTotal; }
    public void setCosteTotal(BigDecimal costeTotal) { this.costeTotal = costeTotal; }
    public BigDecimal getMargen() { return margen; }
    public void setMargen(BigDecimal margen) { this.margen = margen; }
    public Long getContadorPedidos() { return contadorPedidos; }
    public void setContadorPedidos(Long contadorPedidos) { this.contadorPedidos = contadorPedidos; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<ImagenResponse> getImagenes() { return imagenes; }
    public void setImagenes(List<ImagenResponse> imagenes) { this.imagenes = imagenes; }
    public CategoriaResponse getCategoria() { return categoria; }
    public void setCategoria(CategoriaResponse categoria) { this.categoria = categoria; }
    public List<TipoCartaResponse> getTiposCarta() { return tiposCarta; }
    public void setTiposCarta(List<TipoCartaResponse> tiposCarta) { this.tiposCarta = tiposCarta; }

    public static PlatoResponse fromEntity(com.suances.carta.domain.model.Plato entity) {
        PlatoResponse response = new PlatoResponse();
        response.setId(entity.getId());
        response.setNombre(entity.getNombre());
        response.setDescripcion(entity.getDescripcion());
        response.setPrecioVenta(entity.getPrecioVenta());
        response.setContadorPedidos(entity.getContadorPedidos());
        response.setActivo(entity.getActivo());
        response.setCreatedAt(entity.getCreatedAt());

        BigDecimal costeTotal = BigDecimal.ZERO;
        if (entity.getEscandallo() != null) {
            costeTotal = entity.getEscandallo().getCosteTotalSnapshot();
        }
        response.setCosteTotal(costeTotal);

        BigDecimal margen = BigDecimal.ZERO;
        if (entity.getPrecioVenta() != null && entity.getPrecioVenta().compareTo(BigDecimal.ZERO) > 0) {
            margen = entity.getPrecioVenta().subtract(costeTotal)
                    .divide(entity.getPrecioVenta(), 4, RoundingMode.HALF_UP);
        }
        response.setMargen(margen);

        List<ImagenResponse> imagenes = entity.getImagenes().stream()
                .map(ImagenResponse::fromEntity)
                .collect(Collectors.toList());
        response.setImagenes(imagenes);

        if (entity.getCategoria() != null) {
            response.setCategoria(CategoriaResponse.fromEntity(entity.getCategoria()));
        }

        if (entity.getTiposCarta() != null && !entity.getTiposCarta().isEmpty()) {
            List<TipoCartaResponse> tiposCarta = entity.getTiposCarta().stream()
                .map(TipoCartaResponse::fromEntity)
                .collect(Collectors.toList());
            response.setTiposCarta(tiposCarta);
        }

        return response;
    }

    public static class ImagenResponse {
        private UUID id;
        private String url;
        private Integer orden;

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public Integer getOrden() { return orden; }
        public void setOrden(Integer orden) { this.orden = orden; }

        public static ImagenResponse fromEntity(com.suances.carta.domain.model.PlatoImagen entity) {
            ImagenResponse response = new ImagenResponse();
            response.setId(entity.getId());
            response.setUrl(entity.getUrl());
            response.setOrden(entity.getOrden());
            return response;
        }
    }
}
