package com.suances.reservas.domain.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "reserva_audit")
public class ReservaAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id")
    private Reserva reserva;

    @Column(nullable = false, length = 60)
    private String accion;

    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Column(columnDefinition = "jsonb")
    private String payload;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public Reserva getReserva() { return reserva; }
    public void setReserva(Reserva reserva) { this.reserva = reserva; }
    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }
    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
