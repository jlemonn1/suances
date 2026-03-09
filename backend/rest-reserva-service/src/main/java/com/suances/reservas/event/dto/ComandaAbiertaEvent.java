package com.suances.reservas.event.dto;

import java.util.UUID;

public class ComandaAbiertaEvent {
    private UUID mesaId;
    private String fecha;
    private String hora;
    private UUID camareroId;
    private Integer comensales;

    public UUID getMesaId() {
        return mesaId;
    }

    public void setMesaId(UUID mesaId) {
        this.mesaId = mesaId;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }

    public UUID getCamareroId() {
        return camareroId;
    }

    public void setCamareroId(UUID camareroId) {
        this.camareroId = camareroId;
    }

    public Integer getComensales() {
        return comensales;
    }

    public void setComensales(Integer comensales) {
        this.comensales = comensales;
    }
}
