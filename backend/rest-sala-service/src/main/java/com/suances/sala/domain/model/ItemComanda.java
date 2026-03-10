package com.suances.sala.domain.model;

import com.suances.sala.domain.model.enums.TipoRonda;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "comanda_items")
public class ItemComanda {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "comanda_id", nullable = false)
    private UUID comandaId;

    @Column(name = "plato_id", nullable = false)
    private UUID platoId;

    @Column(name = "nombre_plato", nullable = false, length = 200)
    private String nombrePlato;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_ronda", nullable = false)
    private TipoRonda tipoRonda;

    @Column(name = "orden_en_ronda")
    private Integer ordenEnRonda = 1;

    @Column(name = "numero_ronda", nullable = false)
    private Integer numeroRonda = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemEstado estado = ItemEstado.PENDIENTE;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(name = "hora_pedido", nullable = false)
    private OffsetDateTime horaPedido;

    @Column(name = "hora_envio_cocina")
    private OffsetDateTime horaEnvioCocina;

    @Column(name = "hora_listo")
    private OffsetDateTime horaListo;

    @Column(name = "hora_servido")
    private OffsetDateTime horaServido;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = OffsetDateTime.now();
        this.horaPedido = this.createdAt;
    }

    public enum ItemEstado {
        PENDIENTE,
        EN_COCINA,
        LISTO,
        SERVIDO,
        CANCELADO
    }

    // Getters y Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getComandaId() {
        return comandaId;
    }

    public void setComandaId(UUID comandaId) {
        this.comandaId = comandaId;
    }

    public UUID getPlatoId() {
        return platoId;
    }

    public void setPlatoId(UUID platoId) {
        this.platoId = platoId;
    }

    public String getNombrePlato() {
        return nombrePlato;
    }

    public void setNombrePlato(String nombrePlato) {
        this.nombrePlato = nombrePlato;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public TipoRonda getTipoRonda() {
        return tipoRonda;
    }

    public void setTipoRonda(TipoRonda tipoRonda) {
        this.tipoRonda = tipoRonda;
    }

    public Integer getOrdenEnRonda() {
        return ordenEnRonda;
    }

    public void setOrdenEnRonda(Integer ordenEnRonda) {
        this.ordenEnRonda = ordenEnRonda;
    }

    public Integer getNumeroRonda() {
        return numeroRonda;
    }

    public void setNumeroRonda(Integer numeroRonda) {
        this.numeroRonda = numeroRonda;
    }

    public ItemEstado getEstado() {
        return estado;
    }

    public void setEstado(ItemEstado estado) {
        this.estado = estado;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public OffsetDateTime getHoraPedido() {
        return horaPedido;
    }

    public void setHoraPedido(OffsetDateTime horaPedido) {
        this.horaPedido = horaPedido;
    }

    public OffsetDateTime getHoraEnvioCocina() {
        return horaEnvioCocina;
    }

    public void setHoraEnvioCocina(OffsetDateTime horaEnvioCocina) {
        this.horaEnvioCocina = horaEnvioCocina;
    }

    public OffsetDateTime getHoraListo() {
        return horaListo;
    }

    public void setHoraListo(OffsetDateTime horaListo) {
        this.horaListo = horaListo;
    }

    public OffsetDateTime getHoraServido() {
        return horaServido;
    }

    public void setHoraServido(OffsetDateTime horaServido) {
        this.horaServido = horaServido;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public BigDecimal getSubtotal() {
        return precioUnitario.multiply(BigDecimal.valueOf(cantidad));
    }
}
