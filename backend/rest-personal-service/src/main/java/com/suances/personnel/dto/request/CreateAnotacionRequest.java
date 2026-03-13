package com.suances.personnel.dto.request;

import com.suances.personnel.domain.model.AnotacionPersonal.TipoAccion;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CreateAnotacionRequest {

    @NotNull
    private UUID usuarioId;

    @NotNull
    private TipoAccion tipoAccion;

    @NotNull
    private UUID comandaId;

    private Integer mesaNumero;

    private UUID reservaId;

    private String detalle;

    private Boolean exitoso;

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
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
}
