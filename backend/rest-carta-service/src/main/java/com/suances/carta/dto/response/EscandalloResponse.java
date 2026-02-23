package com.suances.carta.dto.response;

import com.suances.carta.domain.model.Escandallo;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class EscandalloResponse {

    private UUID platoId;
    private String nombreVersion;
    private BigDecimal costeTotal;
    private List<IngredienteDetalle> ingredientes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UUID getPlatoId() { return platoId; }
    public void setPlatoId(UUID platoId) { this.platoId = platoId; }
    public String getNombreVersion() { return nombreVersion; }
    public void setNombreVersion(String nombreVersion) { this.nombreVersion = nombreVersion; }
    public BigDecimal getCosteTotal() { return costeTotal; }
    public void setCosteTotal(BigDecimal costeTotal) { this.costeTotal = costeTotal; }
    public List<IngredienteDetalle> getIngredientes() { return ingredientes; }
    public void setIngredientes(List<IngredienteDetalle> ingredientes) { this.ingredientes = ingredientes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static EscandalloResponse fromEntity(Escandallo entity) {
        EscandalloResponse response = new EscandalloResponse();
        response.setPlatoId(entity.getPlato().getId());
        response.setNombreVersion(entity.getNombreVersion());
        response.setCosteTotal(entity.getCosteTotalSnapshot());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());

        List<IngredienteDetalle> detalles = entity.getDetalles().stream()
                .map(d -> {
                    IngredienteDetalle detalle = new IngredienteDetalle();
                    detalle.setIngredienteId(d.getIngrediente().getId());
                    detalle.setNombre(d.getIngrediente().getNombre());
                    detalle.setCantidad(d.getCantidad());
                    BigDecimal coste = d.getCantidad().multiply(d.getIngrediente().getPrecioPorUnidad());
                    detalle.setCoste(coste);
                    return detalle;
                })
                .collect(Collectors.toList());

        response.setIngredientes(detalles);
        return response;
    }

    public static class IngredienteDetalle {
        private UUID ingredienteId;
        private String nombre;
        private BigDecimal cantidad;
        private BigDecimal coste;

        public UUID getIngredienteId() { return ingredienteId; }
        public void setIngredienteId(UUID ingredienteId) { this.ingredienteId = ingredienteId; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public BigDecimal getCantidad() { return cantidad; }
        public void setCantidad(BigDecimal cantidad) { this.cantidad = cantidad; }
        public BigDecimal getCoste() { return coste; }
        public void setCoste(BigDecimal coste) { this.coste = coste; }
    }
}
