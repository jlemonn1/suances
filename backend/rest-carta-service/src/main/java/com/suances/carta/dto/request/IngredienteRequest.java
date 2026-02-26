package com.suances.carta.dto.request;

import com.suances.carta.domain.enums.UnidadMedida;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public class IngredienteRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotNull(message = "La unidad de medida es obligatoria")
    private UnidadMedida unidadMedida;

    @NotNull(message = "El precio por unidad es obligatorio")
    @DecimalMin(value = "0", message = "El precio debe ser mayor o igual a 0")
    private BigDecimal precioPorUnidad;

    @DecimalMin(value = "0", message = "El stock actual debe ser mayor o igual a 0")
    private BigDecimal stockActual = BigDecimal.ZERO;

    @NotNull(message = "El umbral de alerta es obligatorio")
    @DecimalMin(value = "0", message = "El umbral de alerta debe ser mayor o igual a 0")
    private BigDecimal umbralAlerta;

    private UUID categoriaId;

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
    public UUID getCategoriaId() { return categoriaId; }
    public void setCategoriaId(UUID categoriaId) { this.categoriaId = categoriaId; }
}
