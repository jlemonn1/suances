package com.suances.sala.client.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class EscandalloDetalleSyncDto {

    private UUID ingredienteId;
    private String nombre;
    private BigDecimal cantidad;

    // Getters y Setters
    public UUID getIngredienteId() {
        return ingredienteId;
    }

    public void setIngredienteId(UUID ingredienteId) {
        this.ingredienteId = ingredienteId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }
}
