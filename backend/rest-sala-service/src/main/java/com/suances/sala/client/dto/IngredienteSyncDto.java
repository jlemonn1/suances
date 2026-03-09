package com.suances.sala.client.dto;

import com.suances.sala.domain.model.enums.UnidadMedida;

import java.math.BigDecimal;
import java.util.UUID;

public class IngredienteSyncDto {

    private UUID id;
    private String nombre;
    private UnidadMedida unidadMedida;
    private BigDecimal stockActual;
    private BigDecimal umbralAlerta;
    private Boolean alertaEnviada;

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

    public UnidadMedida getUnidadMedida() {
        return unidadMedida;
    }

    public void setUnidadMedida(UnidadMedida unidadMedida) {
        this.unidadMedida = unidadMedida;
    }

    public BigDecimal getStockActual() {
        return stockActual;
    }

    public void setStockActual(BigDecimal stockActual) {
        this.stockActual = stockActual;
    }

    public BigDecimal getUmbralAlerta() {
        return umbralAlerta;
    }

    public void setUmbralAlerta(BigDecimal umbralAlerta) {
        this.umbralAlerta = umbralAlerta;
    }

    public Boolean getAlertaEnviada() {
        return alertaEnviada;
    }

    public void setAlertaEnviada(Boolean alertaEnviada) {
        this.alertaEnviada = alertaEnviada;
    }
}
