package com.suances.sala.client.dto;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class TipoCartaSyncDto {

    private UUID id;
    private String nombre;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Boolean activo;
    private List<PlatoInfoSyncDto> platos;

    // Getters y Setters
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

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public List<PlatoInfoSyncDto> getPlatos() {
        return platos;
    }

    public void setPlatos(List<PlatoInfoSyncDto> platos) {
        this.platos = platos;
    }
}
