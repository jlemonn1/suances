package com.suances.sala.event.dto;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class TipoCartaUpdatedEvent {

    private String eventId;
    private UUID id;
    private String nombre;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Boolean activo;
    private List<PlatoInfoDto> platos;

    public static class PlatoInfoDto {
        private UUID id;
        private String nombre;
        private Integer orden;

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

        public Integer getOrden() {
            return orden;
        }

        public void setOrden(Integer orden) {
            this.orden = orden;
        }
    }

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

    public List<PlatoInfoDto> getPlatos() {
        return platos;
    }

    public void setPlatos(List<PlatoInfoDto> platos) {
        this.platos = platos;
    }
}
