package com.suances.carta.service;

import com.suances.carta.dto.event.StockBajoEvent;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.stream.ObjectRecord;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

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
}
