package com.suances.caja.domain.dto.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SalaComandaCobradaEventData {

    private String comandaId;
    private String mesaId;
    private String codigo;
    private String total;
    private String tipoPago;
    private String montoRecibido;
    private String horaCobro;

    public String getComandaId() { return comandaId; }
    public void setComandaId(String comandaId) { this.comandaId = comandaId; }

    public String getMesaId() { return mesaId; }
    public void setMesaId(String mesaId) { this.mesaId = mesaId; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getTotal() { return total; }
    public void setTotal(String total) { this.total = total; }

    public String getTipoPago() { return tipoPago; }
    public void setTipoPago(String tipoPago) { this.tipoPago = tipoPago; }

    public String getMontoRecibido() { return montoRecibido; }
    public void setMontoRecibido(String montoRecibido) { this.montoRecibido = montoRecibido; }

    public String getHoraCobro() { return horaCobro; }
    public void setHoraCobro(String horaCobro) { this.horaCobro = horaCobro; }
}
