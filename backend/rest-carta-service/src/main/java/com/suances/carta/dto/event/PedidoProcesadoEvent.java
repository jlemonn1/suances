package com.suances.carta.dto.event;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class PedidoProcesadoEvent {

    private UUID eventId;
    private String type;
    private UUID comandaId;
    private UUID mesaId;
    private Integer numeroRonda;
    private String tipoRonda;
    private UUID camareroId;
    private List<ItemProcesado> items;
    private OffsetDateTime timestamp;

    public PedidoProcesadoEvent() {
        this.eventId = UUID.randomUUID();
        this.type = "carta.pedido_procesado";
        this.timestamp = OffsetDateTime.now();
    }

    public UUID getEventId() { return eventId; }
    public void setEventId(UUID eventId) { this.eventId = eventId; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public UUID getComandaId() { return comandaId; }
    public void setComandaId(UUID comandaId) { this.comandaId = comandaId; }
    
    public UUID getMesaId() { return mesaId; }
    public void setMesaId(UUID mesaId) { this.mesaId = mesaId; }
    
    public Integer getNumeroRonda() { return numeroRonda; }
    public void setNumeroRonda(Integer numeroRonda) { this.numeroRonda = numeroRonda; }
    
    public String getTipoRonda() { return tipoRonda; }
    public void setTipoRonda(String tipoRonda) { this.tipoRonda = tipoRonda; }
    
    public UUID getCamareroId() { return camareroId; }
    public void setCamareroId(UUID camareroId) { this.camareroId = camareroId; }
    
    public List<ItemProcesado> getItems() { return items; }
    public void setItems(List<ItemProcesado> items) { this.items = items; }
    
    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }

    public static class ItemProcesado {
        private UUID platoId;
        private String nombrePlato;
        private Integer cantidad;
        private List<IngredienteConsumido> ingredientesConsumidos;

        public ItemProcesado() {}

        public UUID getPlatoId() { return platoId; }
        public void setPlatoId(UUID platoId) { this.platoId = platoId; }
        
        public String getNombrePlato() { return nombrePlato; }
        public void setNombrePlato(String nombrePlato) { this.nombrePlato = nombrePlato; }
        
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
        
        public List<IngredienteConsumido> getIngredientesConsumidos() { return ingredientesConsumidos; }
        public void setIngredientesConsumidos(List<IngredienteConsumido> ingredientesConsumidos) { this.ingredientesConsumidos = ingredientesConsumidos; }
    }

    public static class IngredienteConsumido {
        private UUID ingredienteId;
        private String nombre;
        private BigDecimal cantidadConsumida;
        private BigDecimal stockActual;

        public IngredienteConsumido() {}

        public UUID getIngredienteId() { return ingredienteId; }
        public void setIngredienteId(UUID ingredienteId) { this.ingredienteId = ingredienteId; }
        
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        
        public BigDecimal getCantidadConsumida() { return cantidadConsumida; }
        public void setCantidadConsumida(BigDecimal cantidadConsumida) { this.cantidadConsumida = cantidadConsumida; }
        
        public BigDecimal getStockActual() { return stockActual; }
        public void setStockActual(BigDecimal stockActual) { this.stockActual = stockActual; }
    }
}
