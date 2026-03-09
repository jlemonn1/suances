package com.suances.sala.event.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class IngredienteStockChangedEvent {

    private String eventId;
    private UUID id;
    private String nombre;
    private BigDecimal stockActual;
    private BigDecimal umbralAlerta;
    private Boolean alertaEnviada;

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
