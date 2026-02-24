package com.suances.personnel.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.stream.ObjectRecord;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class SecurityEventProducer {

    private static final Logger log = LoggerFactory.getLogger(SecurityEventProducer.class);
    private static final String STREAM_NAME = "security.events";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public SecurityEventProducer(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public void publishLoginEvent(String type, UUID userId, String username, String role, String ip) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventId", UUID.randomUUID().toString());
            event.put("type", type);
            event.put("timestamp", LocalDateTime.now().toString());

            Map<String, Object> data = new HashMap<>();
            data.put("userId", userId != null ? userId.toString() : null);
            data.put("username", username);
            data.put("role", role);
            data.put("ip", ip);
            event.put("data", data);

            String json = objectMapper.writeValueAsString(event);
            ObjectRecord<String, String> record = StreamRecords.newRecord()
                    .in(STREAM_NAME)
                    .ofObject(json);

            redisTemplate.opsForStream().add(record);
            log.info("Security event published: type={}, username={}", type, username);
        } catch (JsonProcessingException e) {
            log.error("Error al serializar evento de seguridad", e);
        } catch (Exception e) {
            log.warn("No se pudo publicar evento en Redis (¿Redis no disponible?): {}", e.getMessage());
        }
    }
}
