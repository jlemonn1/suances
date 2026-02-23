package com.suances.carta.dto.event;

import java.math.BigDecimal;
import java.util.UUID;

public class StockBajoEvent {

    private UUID ingredienteId;
    private String ingredienteNombre;
    private BigDecimal stockActual;
    private BigDecimal umbral;

    public StockBajoEvent() {}

    public StockBajoEvent(UUID ingredienteId, String ingredienteNombre, BigDecimal stockActual, BigDecimal umbral) {
        this.ingredienteId = ingredienteId;
        this.ingredienteNombre = ingredienteNombre;
        this.stockActual = stockActual;
        this.umbral = umbral;
    }

    public UUID getIngredienteId() { return ingredienteId; }
    public void setIngredienteId(UUID ingredienteId) { this.ingredienteId = ingredienteId; }
    public String getIngredienteNombre() { return ingredienteNombre; }
    public void setIngredienteNombre(String ingredienteNombre) { this.ingredienteNombre = ingredienteNombre; }
    public BigDecimal getStockActual() { return stockActual; }
    public void setStockActual(BigDecimal stockActual) { this.stockActual = stockActual; }
    public BigDecimal getUmbral() { return umbral; }
    public void setUmbral(BigDecimal umbral) { this.umbral = umbral; }
}
