package com.suances.carta.dto.event;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class PlatosAfectadosStockEvent {

    private UUID eventId;
    private String type;
    private List<PlatoAfectado> platos;
    private OffsetDateTime timestamp;

    public PlatosAfectadosStockEvent() {
        this.eventId = UUID.randomUUID();
        this.type = "carta.platos_afectados_stock";
        this.timestamp = OffsetDateTime.now();
    }

    public UUID getEventId() { return eventId; }
    public void setEventId(UUID eventId) { this.eventId = eventId; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public List<PlatoAfectado> getPlatos() { return platos; }
    public void setPlatos(List<PlatoAfectado> platos) { this.platos = platos; }
    
    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }

    public static class PlatoAfectado {
        private UUID platoId;
        private String nombre;
        private List<IngredienteBajo> ingredientesBajos;

        public PlatoAfectado() {}

        public PlatoAfectado(UUID platoId, String nombre, List<IngredienteBajo> ingredientesBajos) {
            this.platoId = platoId;
            this.nombre = nombre;
            this.ingredientesBajos = ingredientesBajos;
        }

        public UUID getPlatoId() { return platoId; }
        public void setPlatoId(UUID platoId) { this.platoId = platoId; }
        
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        
        public List<IngredienteBajo> getIngredientesBajos() { return ingredientesBajos; }
        public void setIngredientesBajos(List<IngredienteBajo> ingredientesBajos) { this.ingredientesBajos = ingredientesBajos; }
    }

    public static class IngredienteBajo {
        private UUID ingredienteId;
        private String nombre;
        private BigDecimal stockActual;
        private BigDecimal umbralAlerta;
        private String unidadMedida;

        public IngredienteBajo() {}

        public IngredienteBajo(UUID ingredienteId, String nombre, BigDecimal stockActual, 
                              BigDecimal umbralAlerta, String unidadMedida) {
            this.ingredienteId = ingredienteId;
            this.nombre = nombre;
            this.stockActual = stockActual;
            this.umbralAlerta = umbralAlerta;
            this.unidadMedida = unidadMedida;
        }

        public UUID getIngredienteId() { return ingredienteId; }
        public void setIngredienteId(UUID ingredienteId) { this.ingredienteId = ingredienteId; }
        
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        
        public BigDecimal getStockActual() { return stockActual; }
        public void setStockActual(BigDecimal stockActual) { this.stockActual = stockActual; }
        
        public BigDecimal getUmbralAlerta() { return umbralAlerta; }
        public void setUmbralAlerta(BigDecimal umbralAlerta) { this.umbralAlerta = umbralAlerta; }
        
        public String getUnidadMedida() { return unidadMedida; }
        public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }
    }
}
