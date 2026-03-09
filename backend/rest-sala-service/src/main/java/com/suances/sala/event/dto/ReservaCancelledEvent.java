package com.suances.sala.event.dto;

import java.util.UUID;

public class ReservaCancelledEvent {
    private UUID eventId;
    private UUID id;
    private UUID mesaId;
    private UUID franjaId;
    private String codigo;
    private String fecha;
    private String motivo;

    public UUID getEventId() { return eventId; }
    public void setEventId(UUID eventId) { this.eventId = eventId; }
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getMesaId() { return mesaId; }
    public void setMesaId(UUID mesaId) { this.mesaId = mesaId; }
    public UUID getFranjaId() { return franjaId; }
    public void setFranjaId(UUID franjaId) { this.franjaId = franjaId; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}
