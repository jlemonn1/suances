package com.suances.sala.event.dto;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class TipoCartaPlatosChangedEvent {

    private String eventId;
    private String type;
    private UUID tipoCartaId;
    private String nombre;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Boolean activo;
    private List<PlatoInfo> platos;

    public static class PlatoInfo {
        private UUID id;
        private String nombre;
        private Integer orden;

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public Integer getOrden() { return orden; }
        public void setOrden(Integer orden) { this.orden = orden; }
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public UUID getTipoCartaId() { return tipoCartaId; }
    public void setTipoCartaId(UUID tipoCartaId) { this.tipoCartaId = tipoCartaId; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }
    public LocalTime getHoraFin() { return horaFin; }
    public void setHoraFin(LocalTime horaFin) { this.horaFin = horaFin; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public List<PlatoInfo> getPlatos() { return platos; }
    public void setPlatos(List<PlatoInfo> platos) { this.platos = platos; }
}
