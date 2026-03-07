package com.suances.carta.dto.event;

import java.time.LocalDateTime;
import java.util.UUID;

public class CartaEventResponse {

    private String type;
    private UUID entityId;
    private String entityName;
    private Object data;
    private LocalDateTime timestamp;

    public CartaEventResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public CartaEventResponse(String type, UUID entityId, String entityName, Object data) {
        this.type = type;
        this.entityId = entityId;
        this.entityName = entityName;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    public static CartaEventResponse stockBajo(UUID ingredienteId, String nombre, Object data) {
        return new CartaEventResponse("INGREDIENTE_STOCK_BAJO", ingredienteId, nombre, data);
    }

    public static CartaEventResponse stockCritico(UUID ingredienteId, String nombre, Object data) {
        return new CartaEventResponse("INGREDIENTE_STOCK_CRITICO", ingredienteId, nombre, data);
    }

    public static CartaEventResponse stockRecuperado(UUID ingredienteId, String nombre, Object data) {
        return new CartaEventResponse("INGREDIENTE_STOCK_RECUPERADO", ingredienteId, nombre, data);
    }

    public static CartaEventResponse platoAgotado(UUID platoId, String nombre, Object data) {
        return new CartaEventResponse("PLATO_AGOTADO", platoId, nombre, data);
    }

    public static CartaEventResponse platoDisponible(UUID platoId, String nombre, Object data) {
        return new CartaEventResponse("PLATO_DISPONIBLE", platoId, nombre, data);
    }

    // Getters y setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }

    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }

    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
