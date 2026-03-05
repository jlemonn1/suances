package com.suances.reservas.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "eventos_procesados")
public class EventoProcesado {

    @Id
    @Column(name = "event_id")
    private UUID eventId;

    @Column(nullable = false, length = 60)
    private String source;

    @Column(name = "processed_at", nullable = false)
    private OffsetDateTime processedAt = OffsetDateTime.now();

    public EventoProcesado() {
    }

    public EventoProcesado(UUID eventId, String source) {
        this.eventId = eventId;
        this.source = source;
    }

    public UUID getEventId() { return eventId; }
    public void setEventId(UUID eventId) { this.eventId = eventId; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public OffsetDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(OffsetDateTime processedAt) { this.processedAt = processedAt; }
}
