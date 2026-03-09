package com.suances.sala.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class SseEmitterManager {

    private static final Logger logger = LoggerFactory.getLogger(SseEmitterManager.class);
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter addEmitter() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);
        logger.info("[SSE-SALA] Nueva conexión. Total: {}", emitters.size());
        
        emitter.onCompletion(() -> {
            emitters.remove(emitter);
            logger.info("[SSE-SALA] Conexión completada. Total: {}", emitters.size());
        });
        emitter.onTimeout(() -> {
            emitters.remove(emitter);
            logger.info("[SSE-SALA] Conexión expirada. Total: {}", emitters.size());
        });
        emitter.onError(e -> {
            emitters.remove(emitter);
            logger.info("[SSE-SALA] Error en conexión. Total: {}", emitters.size());
        });
        
        // Enviar evento de conexión exitosa
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("Conectado a sala-service SSE"));
        } catch (IOException e) {
            logger.error("[SSE-SALA] Error enviando evento de conexión", e);
        }
        
        return emitter;
    }

    public void broadcast(String event, Object data) {
        logger.info("[SSE-SALA] Broadcast: {} a {} conexiones", event, emitters.size());
        List<SseEmitter> emittersToRemove = new CopyOnWriteArrayList<>();
        
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(event)
                        .data(data));
            } catch (IOException e) {
                // Cliente desconectado - esto es normal, no es error
                logger.debug("[SSE-SALA] Cliente desconectado: {}", e.getMessage());
                emittersToRemove.add(emitter);
            } catch (Exception e) {
                logger.warn("[SSE-SALA] Error enviando a cliente: {}", e.getMessage());
                emittersToRemove.add(emitter);
            }
        }
        
        // Remover emitters fallidos
        emitters.removeAll(emittersToRemove);
        if (!emittersToRemove.isEmpty()) {
            logger.info("[SSE-SALA] Removidas {} conexiones cerradas. Total: {}", emittersToRemove.size(), emitters.size());
        }
    }
}
