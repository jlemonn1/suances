package com.suances.carta.dto.event;

import java.util.UUID;

public class EscandalloChangedEvent {

    private String eventId;
    private String type;
    private UUID platoId;
    private String nombrePlato;
    private String nombreVersion;

    public EscandalloChangedEvent() {}

    public EscandalloChangedEvent(String type, UUID platoId, String nombrePlato, String nombreVersion) {
        this.type = type;
        this.platoId = platoId;
        this.nombrePlato = nombrePlato;
        this.nombreVersion = nombreVersion;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public UUID getPlatoId() { return platoId; }
    public void setPlatoId(UUID platoId) { this.platoId = platoId; }
    public String getNombrePlato() { return nombrePlato; }
    public void setNombrePlato(String nombrePlato) { this.nombrePlato = nombrePlato; }
    public String getNombreVersion() { return nombreVersion; }
    public void setNombreVersion(String nombreVersion) { this.nombreVersion = nombreVersion; }
}
