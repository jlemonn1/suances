package com.suances.reservas.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class ReservaEventProducer {

    private static final Logger logger = LoggerFactory.getLogger(ReservaEventProducer.class);

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final String streamOutput;

    public ReservaEventProducer(StringRedisTemplate redisTemplate,
                                ObjectMapper objectMapper,
                                @Value("${app.redis.stream-output}") String streamOutput) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.streamOutput = streamOutput;
    }

    public void publish(String type, Object payload) {
        try {
            Map<String, String> body = new HashMap<>();
            body.put("eventId", UUID.randomUUID().toString());
            body.put("type", type);
            body.put("timestamp", OffsetDateTime.now().toString());
            body.put("data", objectMapper.writeValueAsString(payload));
            MapRecord<String, String, String> record = StreamRecords.mapBacked(body).withStreamKey(streamOutput);
            redisTemplate.opsForStream().add(record);
        } catch (JsonProcessingException ex) {
            logger.error("Error serializando evento {}", type, ex);
        }
    }
}
