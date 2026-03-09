package com.suances.carta.dto.event;

import java.util.UUID;

public class SalaPedidoEvent {

    private UUID eventId;
    private String type;
    private UUID platoId;
    private Integer cantidad;

    public SalaPedidoEvent() {}

    public SalaPedidoEvent(UUID eventId, UUID platoId, Integer cantidad) {
        this.eventId = eventId;
        this.platoId = platoId;
        this.cantidad = cantidad;
    }

    public UUID getEventId() { return eventId; }
    public void setEventId(UUID eventId) { this.eventId = eventId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public UUID getPlatoId() { return platoId; }
    public void setPlatoId(UUID platoId) { this.platoId = platoId; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
}
