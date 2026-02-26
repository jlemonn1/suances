package com.suances.carta.dto.response;

import com.suances.carta.domain.enums.CategoriaTipo;
import java.time.LocalDateTime;
import java.util.UUID;

public class CategoriaResponse {

    private UUID id;
    private String nombre;
    private CategoriaTipo tipo;
    private Boolean activo;
    private LocalDateTime createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public CategoriaTipo getTipo() { return tipo; }
    public void setTipo(CategoriaTipo tipo) { this.tipo = tipo; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static CategoriaResponse fromEntity(com.suances.carta.domain.model.Categoria entity) {
        CategoriaResponse response = new CategoriaResponse();
        response.setId(entity.getId());
        response.setNombre(entity.getNombre());
        response.setTipo(entity.getTipo());
        response.setActivo(entity.getActivo());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }
}
