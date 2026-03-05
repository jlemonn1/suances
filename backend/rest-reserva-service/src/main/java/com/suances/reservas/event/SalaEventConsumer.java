package com.suances.reservas.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SalaEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(SalaEventConsumer.class);

    private final StreamMessageListenerContainer<String, MapRecord<String, String, String>> container;
    private final StringRedisTemplate redisTemplate;
    private final String streamInput;
    private final String consumerGroup;

    public SalaEventConsumer(StreamMessageListenerContainer<String, MapRecord<String, String, String>> container,
                             StringRedisTemplate redisTemplate,
                             @Value("${app.redis.stream-input}") String streamInput,
                             @Value("${app.redis.consumer-group}") String consumerGroup) {
        this.container = container;
        this.redisTemplate = redisTemplate;
        this.streamInput = streamInput;
        this.consumerGroup = consumerGroup;
    }

    @EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    public void subscribe() {
        try {
            redisTemplate.opsForStream().createGroup(streamInput, ReadOffset.latest(), consumerGroup);
        } catch (Exception ignored) {
            // group already exists
        }

        container.receiveAutoAck(
                Consumer.from(consumerGroup, "reservas-" + UUID.randomUUID()),
                StreamOffset.create(streamInput, ReadOffset.lastConsumed()),
                this::handleMessage);
        logger.info("Suscrito a stream {} con grupo {}", streamInput, consumerGroup);
    }

    private void handleMessage(MapRecord<String, String, String> message) {
        String type = message.getValue().getOrDefault("type", "unknown");
        logger.info("Evento recibido de Sala: {} - {}", type, message.getValue());
        // TODO: implementar bloqueo automático de mesas
    }
}
