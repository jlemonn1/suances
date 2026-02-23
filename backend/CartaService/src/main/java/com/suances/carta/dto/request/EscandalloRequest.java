package com.suances.carta.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public class EscandalloRequest {

    @NotBlank(message = "El nombre de versión es obligatorio")
    private String nombreVersion;

    @NotEmpty(message = "Debe incluir al menos un ingrediente")
    @Valid
    private List<IngredienteCantidad> ingredientes;

    public String getNombreVersion() { return nombreVersion; }
    public void setNombreVersion(String nombreVersion) { this.nombreVersion = nombreVersion; }
    public List<IngredienteCantidad> getIngredientes() { return ingredientes; }
    public void setIngredientes(List<IngredienteCantidad> ingredientes) { this.ingredientes = ingredientes; }

    public static class IngredienteCantidad {
        @NotNull(message = "El ID del ingrediente es obligatorio")
        private UUID ingredienteId;

        @NotNull(message = "La cantidad es obligatoria")
        private java.math.BigDecimal cantidad;

        public UUID getIngredienteId() { return ingredienteId; }
        public void setIngredienteId(UUID ingredienteId) { this.ingredienteId = ingredienteId; }
        public java.math.BigDecimal getCantidad() { return cantidad; }
        public void setCantidad(java.math.BigDecimal cantidad) { this.cantidad = cantidad; }
    }
}
