package com.suances.reservas.domain.model;

import com.suances.reservas.domain.model.enums.MesaEstado;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "mesa_estado_hist")
public class MesaEstadoHist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mesa_id")
    private Mesa mesa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MesaEstado estado;

    private String motivo;

    @Column(name = "ref_evento")
    private UUID refEvento;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public Mesa getMesa() { return mesa; }
    public void setMesa(Mesa mesa) { this.mesa = mesa; }
    public MesaEstado getEstado() { return estado; }
    public void setEstado(MesaEstado estado) { this.estado = estado; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public UUID getRefEvento() { return refEvento; }
    public void setRefEvento(UUID refEvento) { this.refEvento = refEvento; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
