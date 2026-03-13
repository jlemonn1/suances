package com.suances.carta.service;

import com.suances.carta.dto.event.EscandalloChangedEvent;
import com.suances.carta.dto.event.IngredienteChangedEvent;
import com.suances.carta.dto.event.PedidoProcesadoEvent;
import com.suances.carta.dto.event.PlatoChangedEvent;
import com.suances.carta.dto.event.PlatoDisponibilidadEvent;
import com.suances.carta.dto.event.PlatosAfectadosStockEvent;
import com.suances.carta.dto.event.PlatosStockMejoradoEvent;
import com.suances.carta.dto.event.StockBajoEvent;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.stream.ObjectRecord;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class EventProducer {

    private static final Logger log = LoggerFactory.getLogger(EventProducer.class);
    private static final String STREAM_NAME = "carta.events";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public EventProducer(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public void publicarStockBajo(StockBajoEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            ObjectRecord<String, String> record = StreamRecords.newRecord()
                    .in(STREAM_NAME)
                    .ofObject(json);

            redisTemplate.opsForStream().add(record);
            log.info("Evento stock bajo publicado para ingrediente: {}", event.getIngredienteNombre());
        } catch (JsonProcessingException e) {
            log.error("Error al serializar evento stock bajo", e);
        }
    }

    public void publicarPlatoCreado(PlatoChangedEvent event) {
        publicarEventoPlato("carta.plato.created", event);
    }

    public void publicarPlatoActualizado(PlatoChangedEvent event) {
        publicarEventoPlato("carta.plato.updated", event);
    }

    public void publicarPlatoDisponibilidad(PlatoDisponibilidadEvent event) {
        try {
            event.setEventId(UUID.randomUUID().toString());
            String json = objectMapper.writeValueAsString(event);
            
            Map<String, String> evento = new HashMap<>();
            evento.put("eventId", event.getEventId());
            evento.put("type", event.getDisponible() ? "carta.plato.disponible" : "carta.plato.no_disponible");
            evento.put("timestamp", java.time.OffsetDateTime.now().toString());
            evento.put("source", "carta-service");
            evento.put("data", json);

            redisTemplate.opsForStream().add(STREAM_NAME, evento);
            log.info("Evento disponibilidad de plato publicado: {} - disponible: {}", event.getNombre(), event.getDisponible());
        } catch (JsonProcessingException e) {
            log.error("Error al serializar evento de disponibilidad de plato", e);
        }
    }

    public void publicarIngredienteCreado(IngredienteChangedEvent event) {
        publicarEventoIngrediente("carta.ingrediente.created", event);
    }

    public void publicarIngredienteActualizado(IngredienteChangedEvent event) {
        publicarEventoIngrediente("carta.ingrediente.updated", event);
    }

    public void publicarStockChanged(IngredienteChangedEvent event) {
        publicarEventoIngrediente("carta.stock.changed", event);
    }

    public void publicarStockBajo(IngredienteChangedEvent event) {
        publicarEventoIngrediente("carta.stock.bajo", event);
    }

    private void publicarEventoPlato(String tipo, PlatoChangedEvent event) {
        try {
            event.setEventId(UUID.randomUUID().toString());
            event.setType(tipo);
            String json = objectMapper.writeValueAsString(event);
            
            Map<String, String> evento = new HashMap<>();
            evento.put("eventId", event.getEventId());
            evento.put("type", tipo);
            evento.put("timestamp", java.time.OffsetDateTime.now().toString());
            evento.put("source", "carta-service");
            evento.put("data", json);

            redisTemplate.opsForStream().add(STREAM_NAME, evento);
            log.info("Evento de plato publicado: {} - {}", tipo, event.getNombre());
        } catch (JsonProcessingException e) {
            log.error("Error al serializar evento de plato", e);
        }
    }

    private void publicarEventoIngrediente(String tipo, IngredienteChangedEvent event) {
        try {
            event.setEventId(UUID.randomUUID().toString());
            event.setType(tipo);
            String json = objectMapper.writeValueAsString(event);
            
            Map<String, String> evento = new HashMap<>();
            evento.put("eventId", event.getEventId());
            evento.put("type", tipo);
            evento.put("timestamp", java.time.OffsetDateTime.now().toString());
            evento.put("source", "carta-service");
            evento.put("data", json);

            redisTemplate.opsForStream().add(STREAM_NAME, evento);
            log.info("Evento de ingrediente publicado: {} - {}", tipo, event.getNombre());
        } catch (JsonProcessingException e) {
            log.error("Error al serializar evento de ingrediente", e);
        }
    }

    public void publicarEscandalloCreado(EscandalloChangedEvent event) {
        publicarEventoEscandallo("carta.escandallo.created", event);
    }

    public void publicarEscandalloActualizado(EscandalloChangedEvent event) {
        publicarEventoEscandallo("carta.escandallo.updated", event);
    }

    public void publicarEscandalloEliminado(EscandalloChangedEvent event) {
        publicarEventoEscandallo("carta.escandallo.deleted", event);
    }

    public void publicarTipoCartaPlatosActualizados(com.suances.carta.dto.event.TipoCartaPlatosChangedEvent event) {
        try {
            event.setEventId(UUID.randomUUID().toString());
            event.setType("carta.tipo_carta.platos_updated");
            String json = objectMapper.writeValueAsString(event);

            Map<String, String> evento = new HashMap<>();
            evento.put("eventId", event.getEventId());
            evento.put("type", "carta.tipo_carta.platos_updated");
            evento.put("timestamp", java.time.OffsetDateTime.now().toString());
            evento.put("source", "carta-service");
            evento.put("data", json);

            redisTemplate.opsForStream().add(STREAM_NAME, evento);
            log.info("Evento tipo carta platos actualizados publicado: {} - {} platos", event.getNombre(), 
                event.getPlatos() != null ? event.getPlatos().size() : 0);
        } catch (JsonProcessingException e) {
            log.error("Error al serializar evento de tipo carta platos actualizados", e);
        }
    }

    private void publicarEventoEscandallo(String tipo, EscandalloChangedEvent event) {
        try {
            event.setEventId(UUID.randomUUID().toString());
            event.setType(tipo);
            String json = objectMapper.writeValueAsString(event);
            
            Map<String, String> evento = new HashMap<>();
            evento.put("eventId", event.getEventId());
            evento.put("type", tipo);
            evento.put("timestamp", java.time.OffsetDateTime.now().toString());
            evento.put("source", "carta-service");
            evento.put("data", json);

            redisTemplate.opsForStream().add(STREAM_NAME, evento);
            log.info("Evento de escandallo publicado: {} - plato: {}", tipo, event.getNombrePlato());
        } catch (JsonProcessingException e) {
            log.error("Error al serializar evento de escandallo", e);
        }
    }

    public void publicarPedidoProcesado(PedidoProcesadoEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            
            Map<String, String> evento = new HashMap<>();
            evento.put("eventId", event.getEventId().toString());
            evento.put("type", "carta.pedido_procesado");
            evento.put("timestamp", java.time.OffsetDateTime.now().toString());
            evento.put("source", "carta-service");
            evento.put("data", json);

            redisTemplate.opsForStream().add(STREAM_NAME, evento);
            log.info("Evento pedido procesado publicado: comanda={}, ronda={}, items={}", 
                    event.getComandaId(), event.getNumeroRonda(), 
                    event.getItems() != null ? event.getItems().size() : 0);
        } catch (JsonProcessingException e) {
            log.error("Error al serializar evento pedido procesado", e);
        }
    }

    public void publicarPlatosAfectadosStock(PlatosAfectadosStockEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            
            Map<String, String> evento = new HashMap<>();
            evento.put("eventId", event.getEventId().toString());
            evento.put("type", "carta.platos_afectados_stock");
            evento.put("timestamp", java.time.OffsetDateTime.now().toString());
            evento.put("source", "carta-service");
            evento.put("data", json);

            redisTemplate.opsForStream().add(STREAM_NAME, evento);
            log.info("Evento platos afectados por stock publicado: {} platos", 
                    event.getPlatos() != null ? event.getPlatos().size() : 0);
        } catch (JsonProcessingException e) {
            log.error("Error al serializar evento platos afectados por stock", e);
        }
    }

    public void publicarPlatosStockMejorado(PlatosStockMejoradoEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            
            Map<String, String> evento = new HashMap<>();
            evento.put("eventId", event.getEventId().toString());
            evento.put("type", "carta.platos_stock_mejorado");
            evento.put("timestamp", java.time.OffsetDateTime.now().toString());
            evento.put("source", "carta-service");
            evento.put("data", json);

            redisTemplate.opsForStream().add(STREAM_NAME, evento);
            log.info("Evento platos con stock mejorado publicado: {} platos", 
                    event.getPlatos() != null ? event.getPlatos().size() : 0);
        } catch (JsonProcessingException e) {
            log.error("Error al serializar evento platos con stock mejorado", e);
        }
    }
}
