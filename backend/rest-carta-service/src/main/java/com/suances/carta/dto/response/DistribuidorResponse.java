package com.suances.carta.dto.response;

import com.suances.carta.domain.model.Distribuidor;
import java.time.LocalDateTime;
import java.util.UUID;

public class DistribuidorResponse {

    private UUID id;
    private String nombre;
    private String email;
    private String telefono;
    private String descripcion;
    private Boolean activo;
    private LocalDateTime createdAt;

    public static DistribuidorResponse fromEntity(Distribuidor distribuidor) {
        DistribuidorResponse response = new DistribuidorResponse();
        response.setId(distribuidor.getId());
        response.setNombre(distribuidor.getNombre());
        response.setEmail(distribuidor.getEmail());
        response.setTelefono(distribuidor.getTelefono());
        response.setDescripcion(distribuidor.getDescripcion());
        response.setActivo(distribuidor.getActivo());
        response.setCreatedAt(distribuidor.getCreatedAt());
        return response;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
