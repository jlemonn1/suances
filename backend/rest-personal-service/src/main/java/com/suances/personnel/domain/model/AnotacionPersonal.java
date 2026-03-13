package com.suances.personnel.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "anotaciones_personal")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnotacionPersonal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false)
    private UUID usuarioId;

    @Column(name = "tipo_accion", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private TipoAccion tipoAccion;

    @Column(name = "comanda_id", nullable = false)
    private UUID comandaId;

    @Column(name = "mesa_numero")
    private Integer mesaNumero;

    @Column(name = "reserva_id")
    private UUID reservaId;

    @Column(name = "detalle", length = 500)
    private String detalle;

    @Column(name = "exitoso")
    private Boolean exitoso;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum TipoAccion {
        EDITAR_COMANDA,
        CANCELAR_COMANDA,
        ELIMINAR_ITEMS
    }
}
