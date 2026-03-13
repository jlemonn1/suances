package com.suances.sala.event.dto;

import java.util.UUID;

public class ReservaCreatedEvent {
    private UUID eventId;
    private UUID id;
    private UUID mesaId;
    private UUID franjaId;
    private String codigo;
    private String estado;
    private String fecha;
    private String nombreCliente;
    private String telefono;
    private Integer comensales;
    private String origen;

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
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }
    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public Integer getComensales() { return comensales; }
    public void setComensales(Integer comensales) { this.comensales = comensales; }
    public String getOrigen() { return origen; }
    public void setOrigen(String origen) { this.origen = origen; }
}
