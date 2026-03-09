package com.suances.sala.client.dto;

import java.util.UUID;

public class PlatoInfoSyncDto {

    private UUID id;
    private String nombre;

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
}
