package com.suances.sala.config;

import com.suances.sala.service.CartaSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class CartaStartupSyncListener implements ApplicationListener<ApplicationReadyEvent> {

    private static final Logger log = LoggerFactory.getLogger(CartaStartupSyncListener.class);

    private final CartaSyncService cartaSyncService;

    public CartaStartupSyncListener(CartaSyncService cartaSyncService) {
        this.cartaSyncService = cartaSyncService;
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        log.info("Aplicación lista. Iniciando sincronización inicial de carta...");
        
        try {
            // Ejecutar sincronización completa en un thread separado para no bloquear el startup
            Thread syncThread = new Thread(() -> {
                try {
                    Thread.sleep(5000); // Esperar 5 segundos para que todo esté inicializado
                    cartaSyncService.sincronizarCartaCompleta();
                    log.info("Sincronización inicial de carta completada");
                } catch (Exception e) {
                    log.error("Error en sincronización inicial de carta", e);
                }
            });
            syncThread.setName("carta-startup-sync");
            syncThread.setDaemon(true);
            syncThread.start();
            
        } catch (Exception e) {
            log.error("Error al iniciar sincronización de carta", e);
        }
    }
}
