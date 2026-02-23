package com.suances.carta.dto.request;

import jakarta.validation.constraints.NotBlank;

public class DistribuidorRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String email;

    private String telefono;

    private String descripcion;

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
