package com.suances.sala.dto.request;

import java.math.BigDecimal;

public class CobrarCuentaRequest {

    private String tipoPago;
    private BigDecimal montoRecibido;
    private BigDecimal propina;

    public CobrarCuentaRequest() {
    }

    public String getTipoPago() {
        return tipoPago;
    }

    public void setTipoPago(String tipoPago) {
        this.tipoPago = tipoPago;
    }

    public BigDecimal getMontoRecibido() {
        return montoRecibido;
    }

    public void setMontoRecibido(BigDecimal montoRecibido) {
        this.montoRecibido = montoRecibido;
    }

    public BigDecimal getPropina() {
        return propina;
    }

    public void setPropina(BigDecimal propina) {
        this.propina = propina;
    }
}
