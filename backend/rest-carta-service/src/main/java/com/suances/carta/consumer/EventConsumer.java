package com.suances.carta.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.suances.carta.domain.model.Escandallo;
import com.suances.carta.domain.model.EscandalloDetalle;
import com.suances.carta.domain.model.EventosProcesados;
import com.suances.carta.domain.model.Ingrediente;
import com.suances.carta.domain.model.Plato;
import com.suances.carta.dto.event.PedidoProcesadoEvent;
import com.suances.carta.dto.event.PlatosAfectadosStockEvent;
import com.suances.carta.dto.event.PlatosStockMejoradoEvent;
import com.suances.carta.dto.event.SalaPedidoEvent;
import com.suances.carta.dto.event.StockBajoEvent;
import com.suances.carta.repository.PlatoRepository;
import com.suances.carta.event.SseEmitterManager;
import com.suances.carta.repository.EscandalloRepository;
import com.suances.carta.repository.EventosProcesadosRepository;
import com.suances.carta.repository.IngredienteRepository;
import com.suances.carta.service.EventProducer;
import com.suances.carta.service.IngredienteService;
import com.suances.carta.service.PlatoService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Component
public class EventConsumer {

    private static final Logger log = LoggerFactory.getLogger(EventConsumer.class);

    @Value("${app.redis.stream-events}")
    private String streamEvents;

    @Value("${app.redis.stream-output}")
    private String streamOutput;

    @Value("${app.redis.group}")
    private String group;

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final EventosProcesadosRepository eventosProcesadosRepository;
    private final PlatoService platoService;
    private final IngredienteService ingredienteService;
    private final IngredienteRepository ingredienteRepository;
    private final PlatoRepository platoRepository;
    private final EventProducer eventProducer;
    private final EscandalloRepository escandalloRepository;
    private final SseEmitterManager sseEmitterManager;

    private ExecutorService executor;
    private volatile boolean activo = true;

    public EventConsumer(StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper,
            EventosProcesadosRepository eventosProcesadosRepository,
            PlatoService platoService,
            IngredienteService ingredienteService,
            IngredienteRepository ingredienteRepository,
            PlatoRepository platoRepository,
            EventProducer eventProducer,
            EscandalloRepository escandalloRepository,
            SseEmitterManager sseEmitterManager) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.eventosProcesadosRepository = eventosProcesadosRepository;
        this.platoService = platoService;
        this.ingredienteService = ingredienteService;
        this.ingredienteRepository = ingredienteRepository;
        this.platoRepository = platoRepository;
        this.eventProducer = eventProducer;
        this.escandalloRepository = escandalloRepository;
        this.sseEmitterManager = sseEmitterManager;
    }

    @PostConstruct
    public void iniciarConsumidor() {
        log.info("Iniciando consumidor de eventos Redis...");
        inicializarConsumerGroup();

        executor = Executors.newSingleThreadExecutor();
        executor.submit(this::consumirEventos);
    }

    @PreDestroy
    public void detenerConsumidor() {
        log.info("Deteniendo consumidor de eventos Redis...");
        activo = false;
        if (executor != null && !executor.isShutdown()) {
            executor.shutdownNow();
        }
    }

    private void inicializarConsumerGroup() {
        try {
            redisTemplate.opsForStream().createGroup(streamEvents, ReadOffset.from("0"), group);
            log.info("Consumer group '{}' creado exitosamente", group);
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("BUSYGROUP")) {
                log.info("Consumer group '{}' ya existe", group);
            } else {
                log.warn("No se pudo crear consumer group (stream puede no existir): {}", e.getMessage());
            }
        }
    }

    private void consumirEventos() {
        log.info("Iniciando bucle de consumo de eventos...");

        while (activo && !Thread.currentThread().isInterrupted()) {
            try {
                List<MapRecord<String, Object, Object>> registros = redisTemplate.opsForStream().read(
                        Consumer.from(group, "carta-consumer"),
                        StreamReadOptions.empty().count(1).block(Duration.ofSeconds(5)),
                        StreamOffset.create(streamEvents, ReadOffset.lastConsumed()));

                if (registros != null && !registros.isEmpty()) {
                    for (MapRecord<String, Object, Object> registro : registros) {
                        procesarEvento(registro);
                    }
                }
            } catch (Exception e) {
                if (!activo) {
                    break;
                }
                log.error("Error en consumidor de eventos", e);
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }

    @Transactional
    private void procesarEvento(MapRecord<String, Object, Object> registro) {
        String eventId = registro.getId().toString();
        Map<Object, Object> datos = registro.getValue();

        log.info("[EVENTO] Recibido evento del stream: id={}", eventId);

        try {
            String json = (String) datos.get("data");
            if (json == null || json.isEmpty()) {
                log.warn("[EVENTO] Evento sin datos JSON, ignorando: {}", eventId);
                redisTemplate.opsForStream().acknowledge(streamEvents, group, eventId);
                return;
            }

            SalaPedidoEvent evento = objectMapper.readValue(json, SalaPedidoEvent.class);

            log.info("[EVENTO] Procesando: type={}, eventId={}, comanda={}, mesa={}, items={}",
                    evento.getType(), evento.getEventId(), evento.getComandaId(), evento.getMesaId(),
                    evento.getItems() != null ? evento.getItems().size() : 0);

            // Solo procesar eventos de ronda enviada a cocina
            if (!"sala.ronda.enviada_cocina".equals(evento.getType())) {
                log.info("[EVENTO] No es tipo 'ronda.enviada_cocina', ignorando: {}", evento.getType());
                redisTemplate.opsForStream().acknowledge(streamEvents, group, eventId);
                return;
            }

            if (eventosProcesadosRepository.existsByEventId(evento.getEventId())) {
                log.info("[EVENTO] Ya procesado anteriormente, ignorando: {}", evento.getEventId());
                redisTemplate.opsForStream().acknowledge(streamEvents, group, eventId);
                return;
            }

            // Procesar cada item de la ronda
            log.info("[EVENTO] Procesando {} items de la ronda", evento.getItems() != null ? evento.getItems().size() : 0);
            List<PedidoProcesadoEvent.ItemProcesado> itemsProcesados = new ArrayList<>();
            
            if (evento.getItems() != null) {
                for (SalaPedidoEvent.ItemPedido item : evento.getItems()) {
                    try {
                        log.info("[EVENTO] Procesando item: platoId={}, nombre={}, cantidad={}",
                                item.getPlatoId(), item.getNombrePlato(), item.getCantidad());
                        
                        // Incrementar contador del plato
                        platoService.incrementarContador(item.getPlatoId(), item.getCantidad());
                        
                        // Descontar stock de ingredientes
                        ingredienteService.descontarStock(item.getPlatoId(), item.getCantidad());
                        
                        // Verificar alertas de stock
                        verificarYEmitirAlertasStock(item.getPlatoId());
                        
                        // Crear ItemProcesado con información de ingredientes
                        PedidoProcesadoEvent.ItemProcesado itemProcesado = crearItemProcesado(item);
                        itemsProcesados.add(itemProcesado);
                        
                        log.info("[EVENTO] Item procesado exitosamente: {}", item.getNombrePlato());
                    } catch (Exception itemEx) {
                        log.error("[EVENTO] Error procesando item {}: {}", item.getPlatoId(), itemEx.getMessage());
                        // Continuamos con el siguiente item
                    }
                }
            }

            // Crear y publicar evento de pedido procesado
            log.info("[EVENTO] Creando evento pedido_procesado con {} items procesados", itemsProcesados.size());
            PedidoProcesadoEvent pedidoProcesado = new PedidoProcesadoEvent();
            pedidoProcesado.setComandaId(evento.getComandaId());
            pedidoProcesado.setMesaId(evento.getMesaId());
            pedidoProcesado.setNumeroRonda(evento.getNumeroRonda());
            pedidoProcesado.setTipoRonda(evento.getTipoRonda());
            pedidoProcesado.setCamareroId(evento.getCamareroId());
            pedidoProcesado.setItems(itemsProcesados);
            
            // Publicar evento a Redis Stream
            log.info("[EVENTO] Publicando a Redis Stream");
            eventProducer.publicarPedidoProcesado(pedidoProcesado);
            
            // Publicar evento vía SSE
            log.info("[EVENTO] Broadcasting via SSE");
            sseEmitterManager.broadcast("carta.pedido_procesado", pedidoProcesado);
            
            log.info("[EVENTO] Pedido procesado y notificado: comanda={}, ronda={}, items={}", 
                    evento.getComandaId(), evento.getNumeroRonda(), itemsProcesados.size());

            // Detectar y notificar platos afectados por stock bajo
            log.info("[CARTA-STOCK] === LLAMANDO a detectarYNotificarPlatosAfectados ===");
            detectarYNotificarPlatosAfectados(evento.getItems());
            log.info("[CARTA-STOCK] === FIN detectarYNotificarPlatosAfectados ===");

            // Marcar evento como procesado
            EventosProcesados eventosProcesados = new EventosProcesados();
            eventosProcesados.setEventId(evento.getEventId());
            eventosProcesadosRepository.save(eventosProcesados);

            redisTemplate.opsForStream().acknowledge(streamEvents, group, eventId);

            log.info("[EVENTO] Procesamiento completado exitosamente: {}", evento.getEventId());

        } catch (Exception e) {
            log.error("[EVENTO] ERROR FATAL al procesar evento {}: {}", eventId, e.getMessage(), e);
            // IMPORTANTE: Reconocer el evento incluso si hay error para no bloquear la cola
            try {
                redisTemplate.opsForStream().acknowledge(streamEvents, group, eventId);
                log.info("[EVENTO] Evento reconocido tras error: {}", eventId);
            } catch (Exception ackEx) {
                log.error("[EVENTO] No se pudo reconocer evento {}: {}", eventId, ackEx.getMessage());
            }
        }
    }

    @Transactional
    private PedidoProcesadoEvent.ItemProcesado crearItemProcesado(SalaPedidoEvent.ItemPedido item) {
        PedidoProcesadoEvent.ItemProcesado itemProcesado = new PedidoProcesadoEvent.ItemProcesado();
        itemProcesado.setPlatoId(item.getPlatoId());
        itemProcesado.setNombrePlato(item.getNombrePlato());
        itemProcesado.setCantidad(item.getCantidad());
        
        // Obtener ingredientes consumidos del escandallo
        List<PedidoProcesadoEvent.IngredienteConsumido> ingredientesConsumidos = new ArrayList<>();
        
        Optional<Escandallo> escandalloOpt = escandalloRepository.findByPlatoIdWithDetalles(item.getPlatoId());
        if (escandalloOpt.isPresent() && escandalloOpt.get().getDetalles() != null) {
            for (EscandalloDetalle detalle : escandalloOpt.get().getDetalles()) {
                Ingrediente ingrediente = detalle.getIngrediente();
                BigDecimal cantidadConsumida = detalle.getCantidad().multiply(BigDecimal.valueOf(item.getCantidad()));
                
                // Refrescar el ingrediente para obtener el stock actual actualizado
                Ingrediente ingredienteActualizado = ingredienteRepository.findById(ingrediente.getId()).orElse(ingrediente);
                
                PedidoProcesadoEvent.IngredienteConsumido ingredienteConsumido = new PedidoProcesadoEvent.IngredienteConsumido();
                ingredienteConsumido.setIngredienteId(ingrediente.getId());
                ingredienteConsumido.setNombre(ingrediente.getNombre());
                ingredienteConsumido.setCantidadConsumida(cantidadConsumida);
                ingredienteConsumido.setStockActual(ingredienteActualizado.getStockActual());
                
                ingredientesConsumidos.add(ingredienteConsumido);
            }
        }
        
        itemProcesado.setIngredientesConsumidos(ingredientesConsumidos);
        return itemProcesado;
    }

    @Transactional
    private void verificarYEmitirAlertasStock(UUID platoId) {
        try {
            Optional<Escandallo> escandallo = escandalloRepository.findByPlatoIdWithDetalles(platoId);
            if (escandallo.isPresent() && escandallo.get().getDetalles() != null) {
                for (EscandalloDetalle detalle : escandallo.get().getDetalles()) {
                    Ingrediente ingrediente = detalle.getIngrediente();
                    if (ingredienteService.verificarCruceUmbral(ingrediente.getId())) {
                        StockBajoEvent evento = new StockBajoEvent(
                                ingrediente.getId(),
                                ingrediente.getNombre(),
                                ingrediente.getStockActual(),
                                ingrediente.getUmbralAlerta());
                        eventProducer.publicarStockBajo(evento);
                        log.info("Alerta de stock bajo emitida para ingrediente: {}", ingrediente.getNombre());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error al verificar alertas de stock", e);
        }
    }

    @Transactional
    private void detectarYNotificarPlatosAfectados(List<SalaPedidoEvent.ItemPedido> items) {
        try {
            if (items == null || items.isEmpty()) {
                return;
            }

            log.info("[EVENTO] Detectando TODOS los platos con stock bajo...");
            
            // Calcular TODOS los platos que tienen ingredientes con stock bajo
            List<PlatosAfectadosStockEvent.PlatoAfectado> platosAfectados = calcularTodosPlatosConStockBajo();

            // Publicar evento si hay platos afectados
            if (!platosAfectados.isEmpty()) {
                PlatosAfectadosStockEvent evento = new PlatosAfectadosStockEvent();
                evento.setPlatos(platosAfectados);
                eventProducer.publicarPlatosAfectadosStock(evento);
                log.info("[EVENTO] Evento platos afectados publicado: {} platos", platosAfectados.size());
            } else {
                log.info("[EVENTO] No hay platos con stock bajo");
                // Enviar evento vacío para limpiar estados en sala
                PlatosAfectadosStockEvent evento = new PlatosAfectadosStockEvent();
                evento.setPlatos(new ArrayList<>());
                eventProducer.publicarPlatosAfectadosStock(evento);
            }

        } catch (Exception e) {
            log.error("[EVENTO] Error al detectar platos afectados: {}", e.getMessage(), e);
        }
    }
    
    public void calcularYNotificarPlatosStockRecuperado(UUID ingredienteId) {
        try {
            log.info("[CARTA-STOCK] === INICIO calcularYNotificarPlatosStockRecuperado para ingredienteId: {}", ingredienteId);
            
            // Obtener el ingrediente
            Ingrediente ingrediente = ingredienteRepository.findById(ingredienteId)
                    .orElse(null);
            if (ingrediente == null) {
                log.warn("[CARTA-STOCK] Ingrediente no encontrado: {}", ingredienteId);
                return;
            }
            
            log.info("[CARTA-STOCK] Ingrediente encontrado: {}, stockActual: {}, umbralAlerta: {}", 
                    ingrediente.getNombre(), ingrediente.getStockActual(), ingrediente.getUmbralAlerta());
            
            // Verificar si el ingrediente ya no está bajo stock
            if (ingrediente.getStockActual().compareTo(ingrediente.getUmbralAlerta()) < 0) {
                log.info("[CARTA-STOCK] El ingrediente {} todavia esta bajo stock (stock: {}, umbral: {}), NO se notifica recuperacion", 
                        ingrediente.getNombre(), ingrediente.getStockActual(), ingrediente.getUmbralAlerta());
                return;
            }
            
            log.info("[CARTA-STOCK] El ingrediente {} tiene stock suficiente, calculando platos afectados...", ingrediente.getNombre());
            
            // Obtener todos los platos que tienen este ingrediente en su escandallo
            List<Escandallo> escandalos = escandalloRepository.findByIngredienteIdWithDetalles(ingredienteId);
            log.info("[CARTA-STOCK] Total escandalos encontrados: {}", escandalos.size());
            
            List<PlatosStockMejoradoEvent.PlatoRecuperado> platosRecuperados = new ArrayList<>();
            
            for (Escandallo escandallo : escandalos) {
                if (escandallo.getDetalles() == null) continue;
                
                // Verificar si este escandallo contiene el ingrediente
                boolean tieneElIngrediente = escandallo.getDetalles().stream()
                        .anyMatch(d -> d.getIngrediente().getId().equals(ingredienteId));
                
                if (!tieneElIngrediente) continue;
                
                log.info("[CARTA-STOCK] El plato {} tiene el ingrediente {}", 
                        escandallo.getPlato() != null ? escandallo.getPlato().getNombre() : "unknown", ingrediente.getNombre());
                
                // Verificar si algún otro ingrediente del escandallo tiene stock bajo
                boolean tieneOtroIngredienteBajo = false;
                for (EscandalloDetalle detalle : escandallo.getDetalles()) {
                    Ingrediente ing = detalle.getIngrediente();
                    // Refrescar para obtener stock actual
                    Ingrediente ingActualizado = ingredienteRepository.findById(ing.getId()).orElse(ing);
                    
                    if (ingActualizado.getStockActual().compareTo(ingActualizado.getUmbralAlerta()) < 0) {
                        log.info("[CARTA-STOCK]   - Ingrediente {} tiene stock bajo: {}/{}", 
                                ingActualizado.getNombre(), ingActualizado.getStockActual(), ingActualizado.getUmbralAlerta());
                        tieneOtroIngredienteBajo = true;
                        break;
                    }
                }
                
                // Si no tiene ningún ingrediente bajo, el plato está recuperado
                if (!tieneOtroIngredienteBajo) {
                    if (escandallo.getPlato() != null) {
                        platosRecuperados.add(new PlatosStockMejoradoEvent.PlatoRecuperado(
                                escandallo.getPlato().getId(),
                                escandallo.getPlato().getNombre()
                        ));
                        log.info("[EVENTO] Plato recuperado: {}", escandallo.getPlato().getNombre());
                    }
                }
            }
            
            // Publicar evento si hay platos recuperados
            if (!platosRecuperados.isEmpty()) {
                PlatosStockMejoradoEvent evento = new PlatosStockMejoradoEvent();
                evento.setPlatos(platosRecuperados);
                eventProducer.publicarPlatosStockMejorado(evento);
                log.info("[EVENTO] Evento platos stock mejorado publicado: {} platos", platosRecuperados.size());
            } else {
                log.info("[EVENTO] No hay platos recuperados (otros ingredientes siguen bajos)");
            }
            
        } catch (Exception e) {
            log.error("[EVENTO] Error al calcular platos stock recuperado: {}", e.getMessage(), e);
        }
    }
    
    private List<PlatosAfectadosStockEvent.PlatoAfectado> calcularTodosPlatosConStockBajo() {
        List<PlatosAfectadosStockEvent.PlatoAfectado> platosAfectados = new ArrayList<>();
        
        List<Escandallo> todosEscandalos = escandalloRepository.findAllWithDetalles();
        
        for (Escandallo escandallo : todosEscandalos) {
            if (escandallo.getDetalles() == null || escandallo.getDetalles().isEmpty()) {
                continue;
            }
            
            Plato plato = escandallo.getPlato();
            if (plato == null) continue;
            
            List<PlatosAfectadosStockEvent.IngredienteBajo> ingredientesBajos = new ArrayList<>();
            
            for (EscandalloDetalle detalle : escandallo.getDetalles()) {
                Ingrediente ingrediente = detalle.getIngrediente();
                if (ingrediente == null) continue;
                
                if (ingrediente.getStockActual().compareTo(ingrediente.getUmbralAlerta()) < 0) {
                    ingredientesBajos.add(new PlatosAfectadosStockEvent.IngredienteBajo(
                            ingrediente.getId(),
                            ingrediente.getNombre(),
                            ingrediente.getStockActual(),
                            ingrediente.getUmbralAlerta(),
                            ingrediente.getUnidadMedida().name()
                    ));
                }
            }
            
            if (!ingredientesBajos.isEmpty()) {
                platosAfectados.add(new PlatosAfectadosStockEvent.PlatoAfectado(
                        plato.getId(),
                        plato.getNombre(),
                        ingredientesBajos
                ));
            }
        }
        
        return platosAfectados;
    }
}
