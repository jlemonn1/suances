package com.suances.carta.dto.event;

import java.util.UUID;

public class PlatoDisponibilidadEvent {

    private String eventId;
    private UUID id;
    private String nombre;
    private Boolean disponible;

    public PlatoDisponibilidadEvent() {}

    public PlatoDisponibilidadEvent(UUID id, String nombre, Boolean disponible) {
        this.id = id;
        this.nombre = nombre;
        this.disponible = disponible;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public Boolean getDisponible() { return disponible; }
    public void setDisponible(Boolean disponible) { this.disponible = disponible; }
}
