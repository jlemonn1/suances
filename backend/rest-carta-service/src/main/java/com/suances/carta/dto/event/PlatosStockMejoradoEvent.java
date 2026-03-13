package com.suances.carta.dto.event;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class PlatosStockMejoradoEvent {

    private UUID eventId;
    private String type;
    private List<PlatoRecuperado> platos;
    private OffsetDateTime timestamp;

    public PlatosStockMejoradoEvent() {
        this.eventId = UUID.randomUUID();
        this.type = "carta.platos_stock_mejorado";
        this.timestamp = OffsetDateTime.now();
    }

    public UUID getEventId() { return eventId; }
    public void setEventId(UUID eventId) { this.eventId = eventId; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public List<PlatoRecuperado> getPlatos() { return platos; }
    public void setPlatos(List<PlatoRecuperado> platos) { this.platos = platos; }
    
    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }

    public static class PlatoRecuperado {
        private UUID platoId;
        private String nombre;

        public PlatoRecuperado() {}

        public PlatoRecuperado(UUID platoId, String nombre) {
            this.platoId = platoId;
            this.nombre = nombre;
        }

        public UUID getPlatoId() { return platoId; }
        public void setPlatoId(UUID platoId) { this.platoId = platoId; }
        
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
    }
}
