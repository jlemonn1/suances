package com.suances.sala.client.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class EscandalloSyncDto {

    private UUID platoId;
    private String nombreVersion;
    private BigDecimal costeTotal;
    private List<EscandalloDetalleSyncDto> ingredientes;

    // Getters y Setters
    public UUID getPlatoId() {
        return platoId;
    }

    public void setPlatoId(UUID platoId) {
        this.platoId = platoId;
    }

    public String getNombreVersion() {
        return nombreVersion;
    }

    public void setNombreVersion(String nombreVersion) {
        this.nombreVersion = nombreVersion;
    }

    public BigDecimal getCosteTotal() {
        return costeTotal;
    }

    public void setCosteTotal(BigDecimal costeTotal) {
        this.costeTotal = costeTotal;
    }

    public List<EscandalloDetalleSyncDto> getIngredientes() {
        return ingredientes;
    }

    public void setIngredientes(List<EscandalloDetalleSyncDto> ingredientes) {
        this.ingredientes = ingredientes;
    }
}
