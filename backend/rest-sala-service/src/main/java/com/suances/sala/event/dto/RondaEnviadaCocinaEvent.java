package com.suances.sala.event.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class RondaEnviadaCocinaEvent {

    private UUID eventId;
    private String type;
    private UUID comandaId;
    private UUID mesaId;
    private Integer numeroRonda;
    private String tipoRonda;
    private UUID camareroId;
    private List<ItemRondaEnviada> items;
    private OffsetDateTime timestamp;

    public RondaEnviadaCocinaEvent() {}

    public RondaEnviadaCocinaEvent(UUID comandaId, UUID mesaId, Integer numeroRonda, 
                                   String tipoRonda, UUID camareroId, List<ItemRondaEnviada> items) {
        this.eventId = UUID.randomUUID();
        this.type = "sala.ronda.enviada_cocina";
        this.comandaId = comandaId;
        this.mesaId = mesaId;
        this.numeroRonda = numeroRonda;
        this.tipoRonda = tipoRonda;
        this.camareroId = camareroId;
        this.items = items;
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
    
    public List<ItemRondaEnviada> getItems() { return items; }
    public void setItems(List<ItemRondaEnviada> items) { this.items = items; }
    
    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }

    public static class ItemRondaEnviada {
        private UUID itemId;
        private UUID platoId;
        private String nombrePlato;
        private Integer cantidad;

        public ItemRondaEnviada() {}

        public ItemRondaEnviada(UUID itemId, UUID platoId, String nombrePlato, Integer cantidad) {
            this.itemId = itemId;
            this.platoId = platoId;
            this.nombrePlato = nombrePlato;
            this.cantidad = cantidad;
        }

        public UUID getItemId() { return itemId; }
        public void setItemId(UUID itemId) { this.itemId = itemId; }
        
        public UUID getPlatoId() { return platoId; }
        public void setPlatoId(UUID platoId) { this.platoId = platoId; }
        
        public String getNombrePlato() { return nombrePlato; }
        public void setNombrePlato(String nombrePlato) { this.nombrePlato = nombrePlato; }
        
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }
}
