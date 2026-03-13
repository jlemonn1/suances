package com.suances.sala.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.suances.sala.domain.model.Comanda;
import com.suances.sala.event.dto.RondaEnviadaCocinaEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class SalaEventProducer {

    private static final Logger log = LoggerFactory.getLogger(SalaEventProducer.class);

    @Value("${app.redis.stream-output}")
    private String streamOutput;

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public SalaEventProducer(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public void publicarComandaAbierta(Comanda comanda) {
        try {
            ObjectNode data = objectMapper.createObjectNode();
            data.put("comandaId", comanda.getId().toString());
            data.put("mesaId", comanda.getMesaId().toString());
            data.put("codigo", comanda.getCodigo());
            data.put("camareroId", comanda.getCamareroId().toString());
            data.put("numeroComensales", comanda.getNumeroComensales());
            data.put("horaApertura", comanda.getFechaApertura().toString());

            publicarEvento("sala.comanda.abierta", data);
            log.info("Evento comanda abierta publicado: {}", comanda.getCodigo());
        } catch (Exception e) {
            log.error("Error al publicar evento comanda abierta", e);
        }
    }

    public void publicarPedidoCreado(com.suances.sala.domain.model.ItemComanda item, UUID mesaId) {
        try {
            ObjectNode data = objectMapper.createObjectNode();
            data.put("itemId", item.getId().toString());
            data.put("comandaId", item.getComandaId().toString());
            data.put("mesaId", mesaId.toString());
            data.put("platoId", item.getPlatoId().toString());
            data.put("nombrePlato", item.getNombrePlato());
            data.put("cantidad", item.getCantidad());
            data.put("tipoRonda", item.getTipoRonda().name());
            data.put("horaPedido", item.getHoraPedido().toString());

            publicarEvento("sala.item.creado", data);
            log.info("Evento item creado publicado: {}", item.getId());
        } catch (Exception e) {
            log.error("Error al publicar evento item creado", e);
        }
    }

    public void publicarItemCreado(UUID comandaId, com.suances.sala.domain.model.ItemComanda item) {
        try {
            ObjectNode data = objectMapper.createObjectNode();
            data.put("itemId", item.getId().toString());
            data.put("comandaId", comandaId.toString());
            data.put("platoId", item.getPlatoId().toString());
            data.put("nombrePlato", item.getNombrePlato());
            data.put("cantidad", item.getCantidad());
            data.put("tipoRonda", item.getTipoRonda().name());
            data.put("horaPedido", item.getHoraPedido().toString());

            publicarEvento("sala.item.creado", data);
            log.info("Evento item creado publicado para carta-service: {}", item.getId());
        } catch (Exception e) {
            log.error("Error al publicar evento item creado", e);
        }
    }

    public void publicarItemEnviadoACocina(UUID comandaId, com.suances.sala.domain.model.ItemComanda item) {
        try {
            ObjectNode data = objectMapper.createObjectNode();
            data.put("itemId", item.getId().toString());
            data.put("comandaId", comandaId.toString());
            data.put("platoId", item.getPlatoId().toString());
            data.put("nombrePlato", item.getNombrePlato());
            data.put("cantidad", item.getCantidad());
            data.put("tipoRonda", item.getTipoRonda().name());
            data.put("horaPedido", item.getHoraPedido().toString());
            data.put("horaEnvioCocina", item.getHoraEnvioCocina().toString());

            publicarEvento("sala.item.enviado_cocina", data);
            log.info("Evento item enviado a cocina publicado: {}", item.getId());
        } catch (Exception e) {
            log.error("Error al publicar evento item enviado a cocina", e);
        }
    }

    public void publicarCuentaCerrada(Comanda comanda, com.suances.sala.domain.dto.response.TicketCobroResponse ticket) {
        try {
            ObjectNode data = objectMapper.createObjectNode();
            data.put("comandaId", comanda.getId().toString());
            data.put("mesaId", comanda.getMesaId().toString());
            data.put("codigo", comanda.getCodigo());
            data.put("total", comanda.getTotal().toString());
            data.put("horaCierre", OffsetDateTime.now().toString());
            
            // Agregar items ordenados del ticket
            ArrayNode itemsArray = objectMapper.createArrayNode();
            for (var ronda : ticket.rondas()) {
                for (var item : ronda.items()) {
                    ObjectNode itemNode = objectMapper.createObjectNode();
                    itemNode.put("tipoRonda", ronda.tipoRonda());
                    itemNode.put("nombrePlato", item.nombrePlato());
                    itemNode.put("cantidad", item.cantidad());
                    itemNode.put("precioUnitario", item.precioUnitario().toString());
                    itemNode.put("subtotal", item.subtotal().toString());
                    itemsArray.add(itemNode);
                }
            }
            data.set("items", itemsArray);

            publicarEvento("sala.cuenta.cerrada", data);
            log.info("Evento cuenta cerrada publicado: {}", comanda.getCodigo());
        } catch (Exception e) {
            log.error("Error al publicar evento cuenta cerrada", e);
        }
    }

    public void publicarComandaCobrada(Comanda comanda, String tipoPago, java.math.BigDecimal montoRecibido) {
        try {
            ObjectNode data = objectMapper.createObjectNode();
            data.put("comandaId", comanda.getId().toString());
            data.put("mesaId", comanda.getMesaId().toString());
            data.put("codigo", comanda.getCodigo());
            data.put("total", comanda.getTotal().toString());
            data.put("tipoPago", tipoPago);
            data.put("montoRecibido", montoRecibido.toString());
            data.put("horaCobro", OffsetDateTime.now().toString());

            publicarEvento("sala.comanda.cobrada", data);
            log.info("Evento comanda cobrada publicado: {}", comanda.getCodigo());
        } catch (Exception e) {
            log.error("Error al publicar evento comanda cobrada", e);
        }
    }

    public void publicarRondaEnviadaCocina(RondaEnviadaCocinaEvent evento) {
        try {
            String json = objectMapper.writeValueAsString(evento);
            
            Map<String, String> eventoMap = new HashMap<>();
            eventoMap.put("eventId", evento.getEventId().toString());
            eventoMap.put("type", evento.getType());
            eventoMap.put("timestamp", evento.getTimestamp().toString());
            eventoMap.put("source", "sala-service");
            eventoMap.put("data", json);

            RecordId recordId = redisTemplate.opsForStream().add(streamOutput, eventoMap);
            log.info("Evento ronda enviada a cocina publicado: comanda={}, ronda={}, items={}, streamId={}", 
                    evento.getComandaId(), evento.getNumeroRonda(), evento.getItems().size(), recordId);
        } catch (JsonProcessingException e) {
            log.error("Error al serializar evento RondaEnviadaCocinaEvent", e);
        } catch (Exception e) {
            log.error("Error al publicar evento ronda enviada a cocina", e);
        }
    }

    private void publicarEvento(String tipo, ObjectNode data) {
        Map<String, String> evento = new HashMap<>();
        evento.put("eventId", UUID.randomUUID().toString());
        evento.put("type", tipo);
        evento.put("timestamp", OffsetDateTime.now().toString());
        evento.put("source", "sala-service");
        evento.put("data", data.toString());

        RecordId recordId = redisTemplate.opsForStream().add(streamOutput, evento);
        log.debug("Evento publicado en stream {} con ID: {}", streamOutput, recordId);
    }
}
