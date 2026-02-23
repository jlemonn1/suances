package com.suances.carta.dto.response;

import com.suances.carta.domain.model.TipoCarta;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class TipoCartaResponse {

    private UUID id;
    private String nombre;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Boolean activo;
    private LocalDateTime createdAt;
    private List<PlatoInfo> platos;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }
    public LocalTime getHoraFin() { return horaFin; }
    public void setHoraFin(LocalTime horaFin) { this.horaFin = horaFin; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<PlatoInfo> getPlatos() { return platos; }
    public void setPlatos(List<PlatoInfo> platos) { this.platos = platos; }

    public static TipoCartaResponse fromEntity(TipoCarta entity) {
        TipoCartaResponse response = new TipoCartaResponse();
        response.setId(entity.getId());
        response.setNombre(entity.getNombre());
        response.setHoraInicio(entity.getHoraInicio());
        response.setHoraFin(entity.getHoraFin());
        response.setActivo(entity.getActivo());
        response.setCreatedAt(entity.getCreatedAt());
        
        if (entity.getPlatos() != null) {
            List<PlatoInfo> platos = entity.getPlatos().stream()
                    .map(PlatoInfo::fromEntity)
                    .collect(Collectors.toList());
            response.setPlatos(platos);
        }
        
        return response;
    }

    public static class PlatoInfo {
        private UUID id;
        private String nombre;

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }

        public static PlatoInfo fromEntity(com.suances.carta.domain.model.Plato plato) {
            PlatoInfo info = new PlatoInfo();
            info.setId(plato.getId());
            info.setNombre(plato.getNombre());
            return info;
        }
    }
}
