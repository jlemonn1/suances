package com.suances.personnel.dto.response;

import com.suances.personnel.domain.model.AnotacionPersonal.TipoAccion;
import java.time.LocalDateTime;
import java.util.UUID;

public class AnotacionPersonalResponse {

    private UUID id;
    private UUID usuarioId;
    private String usuarioNombre;
    private TipoAccion tipoAccion;
    private UUID comandaId;
    private Integer mesaNumero;
    private UUID reservaId;
    private String detalle;
    private Boolean exitoso;
    private LocalDateTime createdAt;

    public AnotacionPersonalResponse(UUID id, UUID usuarioId, String usuarioNombre, 
            TipoAccion tipoAccion, UUID comandaId, Integer mesaNumero, 
            UUID reservaId, String detalle, Boolean exitoso, LocalDateTime createdAt) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.usuarioNombre = usuarioNombre;
        this.tipoAccion = tipoAccion;
        this.comandaId = comandaId;
        this.mesaNumero = mesaNumero;
        this.reservaId = reservaId;
        this.detalle = detalle;
        this.exitoso = exitoso;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public TipoAccion getTipoAccion() {
        return tipoAccion;
    }

    public void setTipoAccion(TipoAccion tipoAccion) {
        this.tipoAccion = tipoAccion;
    }

    public UUID getComandaId() {
        return comandaId;
    }

    public void setComandaId(UUID comandaId) {
        this.comandaId = comandaId;
    }

    public Integer getMesaNumero() {
        return mesaNumero;
    }

    public void setMesaNumero(Integer mesaNumero) {
        this.mesaNumero = mesaNumero;
    }

    public UUID getReservaId() {
        return reservaId;
    }

    public void setReservaId(UUID reservaId) {
        this.reservaId = reservaId;
    }

    public String getDetalle() {
        return detalle;
    }

    public void setDetalle(String detalle) {
        this.detalle = detalle;
    }

    public Boolean getExitoso() {
        return exitoso;
    }

    public void setExitoso(Boolean exitoso) {
        this.exitoso = exitoso;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
