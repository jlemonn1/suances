package com.suances.carta.dto.request;

import com.suances.carta.domain.enums.CategoriaTipo;
import jakarta.validation.constraints.NotBlank;

public class CategoriaRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private CategoriaTipo tipo;

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public CategoriaTipo getTipo() { return tipo; }
    public void setTipo(CategoriaTipo tipo) { this.tipo = tipo; }
}
