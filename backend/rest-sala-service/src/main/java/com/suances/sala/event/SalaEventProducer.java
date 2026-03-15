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
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class SalaEventProducer {

    private static final Logger log = LoggerFactory.getLogger(SalaEventProducer.class);

    @Value("${app.redis.stream-output}")
    private String streamOutput;

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.redis.print-channel}")
    private String printChannel;

    @Value("${app.redis.print-cocina-channel:print/cocina}")
    private String printCocinaChannel;

    @Value("${app.redis.print-barra-channel:print/barra}")
    private String printBarraChannel;

    @Value("${app.printer.cocina-name:Cocina}")
    private String cocinaPrinterName;

    @Value("${app.printer.barra-name:Isabella}")
    private String barraPrinterName;

    @Value("${app.redis.printer-name:POSIFLEX PP-6900}")
    private String printerName;

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

    public void publicarTicketImpresion(com.suances.sala.domain.dto.response.TicketCobroResponse ticket, String impresora) {
        try {
            ObjectNode data = objectMapper.createObjectNode();
            data.put("id", UUID.randomUUID().toString());
            data.put("printer", impresora);
            data.put("comandaId", ticket.comandaId().toString());
            data.put("codigo", ticket.codigo());
            data.put("mesa", ticket.mesaNumero());
            data.put("total", ticket.total().toString());
            data.put("tipo", ticket.tipoTicket());
            data.put("timestamp", OffsetDateTime.now().toString());

            ArrayNode itemsArray = objectMapper.createArrayNode();
            for (var ronda : ticket.rondas()) {
                for (var item : ronda.items()) {
                    ObjectNode itemNode = objectMapper.createObjectNode();
                    itemNode.put("name", item.nombrePlato());
                    itemNode.put("quantity", item.cantidad());
                    itemNode.put("price", item.subtotal().doubleValue());
                    itemsArray.add(itemNode);
                }
            }
            data.set("items", itemsArray);

            String json = data.toString();
            redisTemplate.convertAndSend(printChannel, json);
            log.info("Ticket publicado para imprimir en: {}", impresora);
        } catch (Exception e) {
            log.error("Error al publicar ticket para impresión", e);
        }
    }

    @Value("${app.redis.print-isabella-channel:print/ticket-isabella}")
    private String printIsabellaChannel;

    @Value("${app.redis.print-faro-channel:print/ticket-faro}")
    private String printFaroChannel;

    public void publicarTicketCuentaImpresion(com.suances.sala.domain.dto.response.TicketCobroResponse ticket, String impresoraDestino) {
        try {
            ObjectNode data = objectMapper.createObjectNode();
            data.put("id", UUID.randomUUID().toString());
            data.put("type", "TICKET_CUENTA");
            data.put("printer", printerName);
            data.put("comandaId", ticket.comandaId().toString());
            data.put("codigo", ticket.codigo());
            data.put("mesa", ticket.mesaNumero());
            data.put("camarero", ticket.camareroNombre());
            data.put("comensales", ticket.comensales());
            data.put("fechaApertura", ticket.fechaApertura().toString());
            data.put("subtotal", ticket.subtotal().toString());
            data.put("descuento", ticket.descuento().toString());
            data.put("total", ticket.total().toString());
            data.put("tipoTicket", ticket.tipoTicket());
            data.put("timestamp", OffsetDateTime.now().toString());

            ArrayNode rondasArray = objectMapper.createArrayNode();
            int numeroRonda = 1;
            for (var ronda : ticket.rondas()) {
                ObjectNode rondaNode = objectMapper.createObjectNode();
                rondaNode.put("numeroRonda", numeroRonda++);
                rondaNode.put("tipoRonda", ronda.tipoRonda());
                
                ArrayNode itemsArray = objectMapper.createArrayNode();
                for (var item : ronda.items()) {
                    ObjectNode itemNode = objectMapper.createObjectNode();
                    itemNode.put("nombrePlato", item.nombrePlato());
                    itemNode.put("cantidad", item.cantidad());
                    itemNode.put("precioUnitario", item.precioUnitario().toString());
                    itemNode.put("subtotal", item.subtotal().toString());
                    itemsArray.add(itemNode);
                }
                rondaNode.set("items", itemsArray);
                rondasArray.add(rondaNode);
            }
            data.set("rondas", rondasArray);

            String json = data.toString();
            
            // Send to appropriate channel based on printer destination
            String targetChannel;
            if (impresoraDestino != null && impresoraDestino.equalsIgnoreCase("Faro")) {
                targetChannel = printFaroChannel;
            } else {
                targetChannel = printIsabellaChannel;
            }
            
            redisTemplate.convertAndSend(targetChannel, json);
            log.info("Ticket de cuenta publicado en canal: {} (destino: {})", targetChannel, impresoraDestino);
        } catch (Exception e) {
            log.error("Error al publicar ticket de cuenta para impresión", e);
        }
    }

    public void publicarTicketCocinaImpresion(UUID comandaId, String codigo, String mesa, String nombreSala, String camarero,
            Integer numeroRonda, List<CocinaTicketItem> items) {
        try {
            ObjectNode data = objectMapper.createObjectNode();
            data.put("id", UUID.randomUUID().toString());
            data.put("type", "TICKET_COCINA");
            data.put("printer", cocinaPrinterName);
            data.put("comandaId", comandaId.toString());
            data.put("codigo", codigo);
            data.put("mesa", mesa);
            data.put("sala", nombreSala);
            data.put("camarero", camarero);
            data.put("numeroRonda", numeroRonda);
            data.put("timestamp", OffsetDateTime.now().toString());

            ArrayNode itemsArray = objectMapper.createArrayNode();
            for (var item : items) {
                ObjectNode itemNode = objectMapper.createObjectNode();
                itemNode.put("cantidad", item.cantidad());
                itemNode.put("nombrePlato", item.nombrePlato());
                itemNode.put("tipoRonda", item.tipoRonda());
                itemNode.put("notas", item.notas());
                itemsArray.add(itemNode);
            }
            data.set("items", itemsArray);

            String json = data.toString();
            redisTemplate.convertAndSend(printCocinaChannel, json);
            log.info("Ticket de cocina publicado para imprimir en: {}", cocinaPrinterName);
        } catch (Exception e) {
            log.error("Error al publicar ticket de cocina para impresión", e);
        }
    }

    public void publicarTicketBarraImpresion(UUID comandaId, String codigo, String mesa, String nombreSala, String camarero,
            Integer numeroRonda, List<BarraTicketItem> items) {
        try {
            ObjectNode data = objectMapper.createObjectNode();
            data.put("id", UUID.randomUUID().toString());
            data.put("type", "TICKET_BARRA");
            data.put("printer", barraPrinterName);
            data.put("sala", nombreSala);
            data.put("comandaId", comandaId.toString());
            data.put("codigo", codigo);
            data.put("mesa", mesa);
            data.put("camarero", camarero);
            data.put("numeroRonda", numeroRonda);
            data.put("timestamp", OffsetDateTime.now().toString());

            ArrayNode itemsArray = objectMapper.createArrayNode();
            for (var item : items) {
                ObjectNode itemNode = objectMapper.createObjectNode();
                itemNode.put("cantidad", item.cantidad());
                itemNode.put("nombrePlato", item.nombrePlato());
                itemNode.put("tipoRonda", item.tipoRonda());
                itemNode.put("notas", item.notas());
                itemsArray.add(itemNode);
            }
            data.set("items", itemsArray);

            String json = data.toString();
            redisTemplate.convertAndSend(printBarraChannel, json);
            log.info("Ticket de barra publicado para imprimir en: {}", barraPrinterName);
        } catch (Exception e) {
            log.error("Error al publicar ticket de barra para impresión", e);
        }
    }

    public record CocinaTicketItem(Integer cantidad, String nombrePlato, String tipoRonda, String notas) {}

    public record BarraTicketItem(Integer cantidad, String nombrePlato, String tipoRonda, String notas) {}
}
