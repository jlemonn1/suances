package com.suances.sala.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class MesaEstadoDto {
    private UUID mesaId;
    private Integer numero;
    private UUID salaId;
    private Short capacidad;
    private Integer posX;
    private Integer posY;
    private MesaEstado estado;
    private ReservaInfo reservaInfo;
    private BloqueoInfo bloqueoInfo;

    public enum MesaEstado {
        LIBRE,
        RESERVADA,
        OCUPADA,
        BLOQUEADA
    }

    public static class ReservaInfo {
        private UUID reservaId;
        private String codigo;
        private String nombreCliente;
        private String telefono;
        private Short comensales;
        private UUID franjaId;
        private LocalDate fecha;
        private LocalTime horaInicio;
        private LocalTime horaFin;

        // Getters y setters
        public UUID getReservaId() { return reservaId; }
        public void setReservaId(UUID reservaId) { this.reservaId = reservaId; }
        public String getCodigo() { return codigo; }
        public void setCodigo(String codigo) { this.codigo = codigo; }
        public String getNombreCliente() { return nombreCliente; }
        public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }
        public String getTelefono() { return telefono; }
        public void setTelefono(String telefono) { this.telefono = telefono; }
        public Short getComensales() { return comensales; }
        public void setComensales(Short comensales) { this.comensales = comensales; }
        public UUID getFranjaId() { return franjaId; }
        public void setFranjaId(UUID franjaId) { this.franjaId = franjaId; }
        public LocalDate getFecha() { return fecha; }
        public void setFecha(LocalDate fecha) { this.fecha = fecha; }
        public LocalTime getHoraInicio() { return horaInicio; }
        public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }
        public LocalTime getHoraFin() { return horaFin; }
        public void setHoraFin(LocalTime horaFin) { this.horaFin = horaFin; }
    }

    public static class BloqueoInfo {
        private String tipo;
        private String motivo;

        // Getters y setters
        public String getTipo() { return tipo; }
        public void setTipo(String tipo) { this.tipo = tipo; }
        public String getMotivo() { return motivo; }
        public void setMotivo(String motivo) { this.motivo = motivo; }
    }

    // Getters y setters
    public UUID getMesaId() { return mesaId; }
    public void setMesaId(UUID mesaId) { this.mesaId = mesaId; }
    public Integer getNumero() { return numero; }
    public void setNumero(Integer numero) { this.numero = numero; }
    public UUID getSalaId() { return salaId; }
    public void setSalaId(UUID salaId) { this.salaId = salaId; }
    public Short getCapacidad() { return capacidad; }
    public void setCapacidad(Short capacidad) { this.capacidad = capacidad; }
    public Integer getPosX() { return posX; }
    public void setPosX(Integer posX) { this.posX = posX; }
    public Integer getPosY() { return posY; }
    public void setPosY(Integer posY) { this.posY = posY; }
    public MesaEstado getEstado() { return estado; }
    public void setEstado(MesaEstado estado) { this.estado = estado; }
    public ReservaInfo getReservaInfo() { return reservaInfo; }
    public void setReservaInfo(ReservaInfo reservaInfo) { this.reservaInfo = reservaInfo; }
    public BloqueoInfo getBloqueoInfo() { return bloqueoInfo; }
    public void setBloqueoInfo(BloqueoInfo bloqueoInfo) { this.bloqueoInfo = bloqueoInfo; }
}
