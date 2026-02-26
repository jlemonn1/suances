package com.suances.carta.dto.response;

import com.suances.carta.domain.enums.UnidadMedida;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class IngredienteResponse {

    private UUID id;
    private String nombre;
    private UnidadMedida unidadMedida;
    private BigDecimal precioPorUnidad;
    private BigDecimal stockActual;
    private BigDecimal umbralAlerta;
    private Boolean activo;
    private LocalDateTime createdAt;
    private CategoriaResponse categoria;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public UnidadMedida getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(UnidadMedida unidadMedida) { this.unidadMedida = unidadMedida; }
    public BigDecimal getPrecioPorUnidad() { return precioPorUnidad; }
    public void setPrecioPorUnidad(BigDecimal precioPorUnidad) { this.precioPorUnidad = precioPorUnidad; }
    public BigDecimal getStockActual() { return stockActual; }
    public void setStockActual(BigDecimal stockActual) { this.stockActual = stockActual; }
    public BigDecimal getUmbralAlerta() { return umbralAlerta; }
    public void setUmbralAlerta(BigDecimal umbralAlerta) { this.umbralAlerta = umbralAlerta; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public CategoriaResponse getCategoria() { return categoria; }
    public void setCategoria(CategoriaResponse categoria) { this.categoria = categoria; }

    public static IngredienteResponse fromEntity(com.suances.carta.domain.model.Ingrediente entity) {
        IngredienteResponse response = new IngredienteResponse();
        response.setId(entity.getId());
        response.setNombre(entity.getNombre());
        response.setUnidadMedida(entity.getUnidadMedida());
        response.setPrecioPorUnidad(entity.getPrecioPorUnidad());
        response.setStockActual(entity.getStockActual());
        response.setUmbralAlerta(entity.getUmbralAlerta());
        response.setActivo(entity.getActivo());
        response.setCreatedAt(entity.getCreatedAt());
        if (entity.getCategoria() != null) {
            response.setCategoria(CategoriaResponse.fromEntity(entity.getCategoria()));
        }
        return response;
    }
}
