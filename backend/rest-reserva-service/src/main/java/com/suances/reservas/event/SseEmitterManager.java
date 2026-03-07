package com.suances.reservas.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class SseEmitterManager {

    private static final Logger logger = LoggerFactory.getLogger(SseEmitterManager.class);
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter addEmitter() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);
        logger.info("[SSE] Nueva conexión SSE activa. Total conexiones: {}", emitters.size());
        emitter.onCompletion(() -> {
            emitters.remove(emitter);
            logger.info("[SSE] Conexión completada. Total conexiones: {}", emitters.size());
        });
        emitter.onTimeout(() -> {
            emitters.remove(emitter);
            logger.info("[SSE] Conexión expirada. Total conexiones: {}", emitters.size());
        });
        emitter.onError(e -> {
            emitters.remove(emitter);
            logger.info("[SSE] Error en conexión. Total conexiones: {}", emitters.size());
        });
        return emitter;
    }

    public void broadcast(String event, Object data) {
        logger.info("[SSE] Broadcast evento: {} a {} conexiones", event, emitters.size());
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(event)
                        .data(data));
            } catch (Exception e) {
                emitters.remove(emitter);
            }
        }
    }
}
