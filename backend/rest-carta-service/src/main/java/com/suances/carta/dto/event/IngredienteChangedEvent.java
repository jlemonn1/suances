package com.suances.carta.dto.event;

import com.suances.carta.domain.enums.UnidadMedida;

import java.math.BigDecimal;
import java.util.UUID;

public class IngredienteChangedEvent {

    private String eventId;
    private String type;
    private UUID id;
    private String nombre;
    private UnidadMedida unidadMedida;
    private BigDecimal stockActual;
    private BigDecimal umbralAlerta;
    private Boolean activo;

    public IngredienteChangedEvent() {}

    public IngredienteChangedEvent(String type, UUID id, String nombre, UnidadMedida unidadMedida,
                                   BigDecimal stockActual, BigDecimal umbralAlerta, Boolean activo) {
        this.type = type;
        this.id = id;
        this.nombre = nombre;
        this.unidadMedida = unidadMedida;
        this.stockActual = stockActual;
        this.umbralAlerta = umbralAlerta;
        this.activo = activo;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public UnidadMedida getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(UnidadMedida unidadMedida) { this.unidadMedida = unidadMedida; }
    public BigDecimal getStockActual() { return stockActual; }
    public void setStockActual(BigDecimal stockActual) { this.stockActual = stockActual; }
    public BigDecimal getUmbralAlerta() { return umbralAlerta; }
    public void setUmbralAlerta(BigDecimal umbralAlerta) { this.umbralAlerta = umbralAlerta; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
