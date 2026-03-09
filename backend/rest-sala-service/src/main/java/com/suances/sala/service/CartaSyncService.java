package com.suances.sala.service;

import com.suances.sala.client.CartaRestClient;
import com.suances.sala.client.dto.*;
import com.suances.sala.domain.model.*;
import com.suances.sala.domain.model.enums.UnidadMedida;
import com.suances.sala.event.SseEmitterManager;
import com.suances.sala.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CartaSyncService {

    private static final Logger log = LoggerFactory.getLogger(CartaSyncService.class);

    private final CartaRestClient cartaRestClient;
    private final CartaPlatoOperativoRepository platoRepository;
    private final CartaIngredienteOperativoRepository ingredienteRepository;
    private final CartaEscandalloOperativoRepository escandalloRepository;
    private final CartaTipoCartaOperativoRepository tipoCartaRepository;
    private final CartaPlatoIngredienteOperativoRepository platoIngredienteRepository;
    private final CartaTipoCartaPlatoOperativoRepository tipoCartaPlatoRepository;
    private final SseEmitterManager sseEmitterManager;

    public CartaSyncService(CartaRestClient cartaRestClient,
                            CartaPlatoOperativoRepository platoRepository,
                            CartaIngredienteOperativoRepository ingredienteRepository,
                            CartaEscandalloOperativoRepository escandalloRepository,
                            CartaTipoCartaOperativoRepository tipoCartaRepository,
                            CartaPlatoIngredienteOperativoRepository platoIngredienteRepository,
                            CartaTipoCartaPlatoOperativoRepository tipoCartaPlatoRepository,
                            SseEmitterManager sseEmitterManager) {
        this.cartaRestClient = cartaRestClient;
        this.platoRepository = platoRepository;
        this.ingredienteRepository = ingredienteRepository;
        this.escandalloRepository = escandalloRepository;
        this.tipoCartaRepository = tipoCartaRepository;
        this.platoIngredienteRepository = platoIngredienteRepository;
        this.tipoCartaPlatoRepository = tipoCartaPlatoRepository;
        this.sseEmitterManager = sseEmitterManager;
    }

    @Transactional
    public void sincronizarCartaCompleta() {
        log.info("Iniciando sincronización completa de carta");

        try {
            // 1. Sincronizar ingredientes primero (necesarios para calcular stock de platos)
            sincronizarIngredientes();

            // 2. Sincronizar platos con imagen e ingredientes
            sincronizarPlatos();

            // 3. Sincronizar escandallos (recetas)
            sincronizarEscandallos();

            // 4. Calcular stock disponible para cada plato
            calcularStockTodosPlatos();

            // 5. Sincronizar tipos de carta
            sincronizarTiposCarta();

            log.info("Sincronización completa de carta finalizada exitosamente");
        } catch (Exception e) {
            log.error("Error durante la sincronización completa de carta", e);
            throw e;
        }
    }

    @Scheduled(cron = "0 0 6 * * ?") // Todos los días a las 6:00 AM
    @Transactional
    public void sincronizarDiaria() {
        log.info("Iniciando sincronización diaria de carta (6:00 AM)");
        sincronizarCartaCompleta();
    }

    @Transactional
    public void sincronizarIngredientes() {
        log.info("Sincronizando ingredientes desde carta-service");

        List<IngredienteSyncDto> ingredientes = cartaRestClient.obtenerIngredientes();

        for (IngredienteSyncDto dto : ingredientes) {
            CartaIngredienteOperativo ingrediente = ingredienteRepository.findByIngredienteId(dto.getId())
                    .orElse(new CartaIngredienteOperativo());

            ingrediente.setIngredienteId(dto.getId());
            ingrediente.setNombre(dto.getNombre());
            ingrediente.setUnidadMedida(dto.getUnidadMedida() != null ? dto.getUnidadMedida() : UnidadMedida.GRAMO);
            ingrediente.setStockActual(dto.getStockActual());
            ingrediente.setUmbralAlerta(dto.getUmbralAlerta());
            ingrediente.setAlertaActiva(verificarAlertaStock(dto.getStockActual(), dto.getUmbralAlerta()));

            ingredienteRepository.save(ingrediente);
        }

        log.info("Sincronizados {} ingredientes", ingredientes.size());
    }

    @Transactional
    public void sincronizarPlatos() {
        log.info("Sincronizando platos desde carta-service");

        List<PlatoSyncDto> platos = cartaRestClient.obtenerPlatos();

        for (PlatoSyncDto dto : platos) {
            CartaPlatoOperativo plato = platoRepository.findByPlatoId(dto.getId())
                    .orElse(new CartaPlatoOperativo());

            plato.setPlatoId(dto.getId());
            plato.setNombre(dto.getNombre());
            plato.setDescripcion(dto.getDescripcion());
            plato.setPrecioVenta(dto.getPrecioVenta());
            plato.setCategoriaId(dto.getCategoriaId());
            plato.setCategoriaNombre(dto.getCategoriaNombre());
            plato.setDisponible(dto.getActivo() != null ? dto.getActivo() : true);
            
            // Guardar primera imagen del plato
            if (dto.getImagenes() != null && !dto.getImagenes().isEmpty()) {
                plato.setImagenUrl(dto.getImagenes().get(0).getUrl());
            }

            // Mantener el contador local si existe, o usar el de carta-service
            if (plato.getContadorPedidosLocal() == null && dto.getContadorPedidos() != null) {
                plato.setContadorPedidosLocal(dto.getContadorPedidos());
            }

            platoRepository.save(plato);
            
            // Sincronizar ingredientes del plato (para mostrar en la app)
            sincronizarIngredientesPlato(dto.getId());
        }

        log.info("Sincronizados {} platos", platos.size());
    }
    
    @Transactional
    public void sincronizarIngredientesPlato(UUID platoId) {
        // Obtener escandallo para extraer nombres de ingredientes
        EscandalloSyncDto escandallo = cartaRestClient.obtenerEscandallo(platoId);
        
        if (escandallo != null && escandallo.getIngredientes() != null) {
            // Eliminar ingredientes anteriores
            platoIngredienteRepository.deleteByPlatoId(platoId);
            
            // Guardar nuevos ingredientes (solo nombre)
            int orden = 0;
            for (EscandalloDetalleSyncDto detalle : escandallo.getIngredientes()) {
                CartaPlatoIngredienteOperativo platoIngrediente = new CartaPlatoIngredienteOperativo();
                platoIngrediente.setPlatoId(platoId);
                platoIngrediente.setIngredienteOrden(orden++);
                platoIngrediente.setIngredienteNombre(detalle.getNombre());
                platoIngredienteRepository.save(platoIngrediente);
            }
        }
    }
    
    @Transactional
    public void sincronizarPlatoIndividual(UUID platoId) {
        log.info("Sincronizando plato individual: {}", platoId);
        
        PlatoSyncDto dto = cartaRestClient.obtenerPlatoPorId(platoId);
        if (dto == null) {
            log.warn("Plato no encontrado en carta-service: {}", platoId);
            return;
        }
        
        CartaPlatoOperativo plato = platoRepository.findByPlatoId(platoId)
                .orElse(new CartaPlatoOperativo());
        
        plato.setPlatoId(dto.getId());
        plato.setNombre(dto.getNombre());
        plato.setDescripcion(dto.getDescripcion());
        plato.setPrecioVenta(dto.getPrecioVenta());
        plato.setCategoriaId(dto.getCategoriaId());
        plato.setCategoriaNombre(dto.getCategoriaNombre());
        plato.setDisponible(dto.getActivo() != null ? dto.getActivo() : true);
        
        if (dto.getImagenes() != null && !dto.getImagenes().isEmpty()) {
            plato.setImagenUrl(dto.getImagenes().get(0).getUrl());
        }
        
        platoRepository.save(plato);
        
        // Sincronizar ingredientes
        sincronizarIngredientesPlato(platoId);
        
        log.info("Plato sincronizado: {}", dto.getNombre());
    }

    @Transactional
    public void sincronizarEscandallos() {
        log.info("Sincronizando escandallos desde carta-service");

        // Obtener todos los platos activos
        List<CartaPlatoOperativo> platos = platoRepository.findByDisponibleTrue();
        int escandallosSincronizados = 0;

        for (CartaPlatoOperativo plato : platos) {
            EscandalloSyncDto escandallo = cartaRestClient.obtenerEscandallo(plato.getPlatoId());

            if (escandallo != null && escandallo.getIngredientes() != null) {
                // Eliminar escandallo anterior si existe
                escandalloRepository.deleteByPlatoId(plato.getPlatoId());

                // Crear nuevos registros de escandallo
                for (EscandalloDetalleSyncDto detalle : escandallo.getIngredientes()) {
                    CartaEscandalloOperativo escandalloOp = new CartaEscandalloOperativo();
                    escandalloOp.setPlatoId(plato.getPlatoId());
                    escandalloOp.setIngredienteId(detalle.getIngredienteId());
                    escandalloOp.setCantidadNecesaria(detalle.getCantidad());

                    escandalloRepository.save(escandalloOp);
                }

                escandallosSincronizados++;
            }
        }

        log.info("Sincronizados {} escandallos", escandallosSincronizados);
    }

    @Transactional
    public void sincronizarTiposCarta() {
        log.info("Sincronizando tipos de carta desde carta-service");

        List<TipoCartaSyncDto> tiposCarta = cartaRestClient.obtenerTiposCarta();

        for (TipoCartaSyncDto dto : tiposCarta) {
            CartaTipoCartaOperativo tipoCarta = tipoCartaRepository.findByTipoCartaId(dto.getId())
                    .orElse(new CartaTipoCartaOperativo());

            tipoCarta.setTipoCartaId(dto.getId());
            tipoCarta.setNombre(dto.getNombre());
            tipoCarta.setHoraInicio(dto.getHoraInicio());
            tipoCarta.setHoraFin(dto.getHoraFin());
            tipoCarta.setActivo(dto.getActivo() != null ? dto.getActivo() : true);
            tipoCarta.setFechaSincronizacion(OffsetDateTime.now());

            tipoCartaRepository.save(tipoCarta);
            
            // Sincronizar relación platos del tipo usando tabla intermedia
            sincronizarPlatosTipoCarta(dto.getId(), dto.getPlatos());
        }

        log.info("Sincronizados {} tipos de carta", tiposCarta.size());
    }
    
    @Transactional
    public void sincronizarPlatosTipoCarta(UUID tipoCartaId, List<PlatoInfoSyncDto> platos) {
        // Eliminar relaciones anteriores
        tipoCartaPlatoRepository.deleteByTipoCartaId(tipoCartaId);
        
        // Crear nuevas relaciones
        if (platos != null) {
            int orden = 0;
            for (PlatoInfoSyncDto plato : platos) {
                CartaTipoCartaPlatoOperativo relacion = new CartaTipoCartaPlatoOperativo();
                relacion.setTipoCartaId(tipoCartaId);
                relacion.setPlatoId(plato.getId());
                relacion.setOrden(orden++);
                tipoCartaPlatoRepository.save(relacion);
            }
        }
    }

    @Transactional
    public void calcularStockTodosPlatos() {
        log.info("Calculando stock disponible para todos los platos");

        List<CartaPlatoOperativo> platos = platoRepository.findByDisponibleTrue();

        for (CartaPlatoOperativo plato : platos) {
            BigDecimal stockCalculado = calcularStockPlato(plato.getPlatoId());
            plato.setStockDisponible(stockCalculado);
            platoRepository.save(plato);
        }

        log.info("Stock calculado para {} platos", platos.size());
    }

    public BigDecimal calcularStockPlato(UUID platoId) {
        // Obtener escandallo del plato
        List<CartaEscandalloOperativo> escandallo = escandalloRepository.findByPlatoId(platoId);

        if (escandallo.isEmpty()) {
            // Si no tiene escandallo, asumimos stock ilimitado (null)
            return null;
        }

        BigDecimal stockMinimo = null;

        for (CartaEscandalloOperativo detalle : escandallo) {
            Optional<CartaIngredienteOperativo> ingredienteOpt = 
                    ingredienteRepository.findByIngredienteId(detalle.getIngredienteId());

            if (ingredienteOpt.isPresent() && ingredienteOpt.get().getStockActual() != null) {
                BigDecimal stockIngrediente = ingredienteOpt.get().getStockActual();
                BigDecimal cantidadNecesaria = detalle.getCantidadNecesaria();

                if (cantidadNecesaria != null && cantidadNecesaria.compareTo(BigDecimal.ZERO) > 0) {
                    // Calcular cuántos platos podemos hacer con este ingrediente
                    BigDecimal platosPosibles = stockIngrediente.divide(cantidadNecesaria, 0, RoundingMode.FLOOR);

                    if (stockMinimo == null || platosPosibles.compareTo(stockMinimo) < 0) {
                        stockMinimo = platosPosibles;
                    }
                }
            } else {
                // Si falta algún ingrediente, stock es 0
                return BigDecimal.ZERO;
            }
        }

        return stockMinimo;
    }

    @Transactional
    public void actualizarStockPlato(UUID platoId, Integer cantidadPedida) {
        Optional<CartaPlatoOperativo> platoOpt = platoRepository.findByPlatoId(platoId);

        if (platoOpt.isPresent()) {
            CartaPlatoOperativo plato = platoOpt.get();

            // Actualizar contador local
            plato.setContadorPedidosLocal(plato.getContadorPedidosLocal() + cantidadPedida);

            // Recalcular stock
            BigDecimal stockActual = calcularStockPlato(platoId);
            plato.setStockDisponible(stockActual);

            platoRepository.save(plato);

            log.debug("Actualizado stock del plato {} después de pedido de {} unidades. Stock actual: {}",
                    platoId, cantidadPedida, stockActual);
        }
    }

    @Transactional
    public void actualizarIngrediente(UUID ingredienteId, BigDecimal stockActual, BigDecimal umbralAlerta) {
        Optional<CartaIngredienteOperativo> ingredienteOpt = ingredienteRepository.findByIngredienteId(ingredienteId);

        if (ingredienteOpt.isPresent()) {
            CartaIngredienteOperativo ingrediente = ingredienteOpt.get();
            ingrediente.setStockActual(stockActual);
            ingrediente.setUmbralAlerta(umbralAlerta);
            ingrediente.setAlertaActiva(verificarAlertaStock(stockActual, umbralAlerta));
            ingredienteRepository.save(ingrediente);

            // Recalcular stock de todos los platos que usan este ingrediente
            recalcularStockPlatosConIngrediente(ingredienteId);
        }
    }

    @Transactional
    public void recalcularStockPlatosConIngrediente(UUID ingredienteId) {
        // Obtener todos los platos que usan este ingrediente
        List<CartaEscandalloOperativo> escandallos = escandalloRepository.findByIngredienteId(ingredienteId);

        for (CartaEscandalloOperativo escandallo : escandallos) {
            Optional<CartaPlatoOperativo> platoOpt = platoRepository.findByPlatoId(escandallo.getPlatoId());

            if (platoOpt.isPresent()) {
                CartaPlatoOperativo plato = platoOpt.get();
                BigDecimal stockCalculado = calcularStockPlato(plato.getPlatoId());
                plato.setStockDisponible(stockCalculado);
                platoRepository.save(plato);
            }
        }

        log.debug("Recalculado stock para {} platos que usan el ingrediente {}", 
                escandallos.size(), ingredienteId);
    }

    private boolean verificarAlertaStock(BigDecimal stockActual, BigDecimal umbralAlerta) {
        if (stockActual == null || umbralAlerta == null) {
            return false;
        }
        return stockActual.compareTo(umbralAlerta) <= 0;
    }

    // Métodos de consulta

    public Optional<CartaPlatoOperativo> obtenerPlato(UUID platoId) {
        return platoRepository.findByPlatoId(platoId);
    }

    public List<CartaPlatoOperativo> obtenerPlatosDisponibles() {
        return platoRepository.findByDisponibleTrue();
    }

    public List<CartaPlatoOperativo> obtenerPlatosConStockBajo(Integer umbral) {
        return platoRepository.findPlatosConStockBajo(umbral);
    }

    public boolean verificarStockBajo(UUID platoId) {
        Optional<CartaPlatoOperativo> platoOpt = platoRepository.findByPlatoId(platoId);

        if (platoOpt.isPresent()) {
            CartaPlatoOperativo plato = platoOpt.get();
            // Consideramos stock bajo si tiene menos de 5 unidades o si está en null/0
            return plato.getStockDisponible() != null && 
                   plato.getStockDisponible().compareTo(new BigDecimal(5)) <= 0;
        }

        return false;
    }

    public List<CartaTipoCartaOperativo> obtenerTiposCartaActivos() {
        return tipoCartaRepository.findByActivoTrue();
    }

    public List<CartaTipoCartaOperativo> obtenerCartaActivaPorHora() {
        LocalTime ahora = LocalTime.now();
        return tipoCartaRepository.findTiposCartaActivosPorHora(ahora);
    }
    
    public List<CartaPlatoIngredienteOperativo> obtenerIngredientesPlato(UUID platoId) {
        return platoIngredienteRepository.findByPlatoIdOrderByIngredienteOrdenAsc(platoId);
    }
    
    public List<CartaPlatoOperativo> obtenerPlatosPorTipoCarta(UUID tipoCartaId) {
        List<CartaTipoCartaPlatoOperativo> relaciones = tipoCartaPlatoRepository.findByTipoCartaIdOrderByOrdenAsc(tipoCartaId);
        List<CartaPlatoOperativo> platos = new ArrayList<>();
        
        for (CartaTipoCartaPlatoOperativo relacion : relaciones) {
            platoRepository.findByPlatoId(relacion.getPlatoId()).ifPresent(platos::add);
        }
        
        return platos;
    }

    @Transactional
    public CartaPlatoOperativo actualizarPlatoOperativo(UUID platoId, String nombre, String descripcion,
                                                         BigDecimal precioVenta, UUID categoriaId,
                                                         String categoriaNombre, Boolean activo, String imagenUrl) {
        Optional<CartaPlatoOperativo> platoOpt = platoRepository.findByPlatoId(platoId);
        
        CartaPlatoOperativo plato;
        if (platoOpt.isPresent()) {
            plato = platoOpt.get();
            log.info("Actualizando plato existente: {}", platoId);
        } else {
            plato = new CartaPlatoOperativo();
            plato.setPlatoId(platoId);
            log.info("Creando nuevo plato operativo: {}", platoId);
        }

        plato.setNombre(nombre);
        plato.setDescripcion(descripcion);
        plato.setPrecioVenta(precioVenta);
        plato.setCategoriaId(categoriaId);
        plato.setCategoriaNombre(categoriaNombre);
        plato.setDisponible(activo != null ? activo : true);
        plato.setImagenUrl(imagenUrl);

        CartaPlatoOperativo saved = platoRepository.save(plato);
        log.info("Plato guardado en BD: {} - {}", saved.getPlatoId(), saved.getNombre());

        return saved;
    }

    @Transactional
    public CartaPlatoOperativo actualizarDisponibilidadPlato(UUID platoId, Boolean disponible) {
        Optional<CartaPlatoOperativo> platoOpt = platoRepository.findByPlatoId(platoId);
        
        if (platoOpt.isPresent()) {
            CartaPlatoOperativo plato = platoOpt.get();
            plato.setDisponible(disponible);
            CartaPlatoOperativo saved = platoRepository.save(plato);
            log.info("Disponibilidad actualizada para plato {}: {}", platoId, disponible);
            return saved;
        } else {
            log.warn("No se encontró plato para actualizar disponibilidad: {}", platoId);
            return null;
        }
    }

    @Transactional
    public void recalcularStockYNotificar(UUID ingredienteId) {
        log.info("Recalculando stock para platos con ingrediente: {}", ingredienteId);
        
        List<CartaEscandalloOperativo> escandallos = escandalloRepository.findByIngredienteId(ingredienteId);
        log.info("Encontrados {} platos que usan el ingrediente {}", escandallos.size(), ingredienteId);

        for (CartaEscandalloOperativo escandallo : escandallos) {
            Optional<CartaPlatoOperativo> platoOpt = platoRepository.findByPlatoId(escandallo.getPlatoId());
            
            if (platoOpt.isPresent()) {
                CartaPlatoOperativo plato = platoOpt.get();
                BigDecimal stockAnterior = plato.getStockDisponible();
                BigDecimal stockNuevo = calcularStockPlato(plato.getPlatoId());
                
                if (stockAnterior == null || stockNuevo == null || 
                    stockAnterior.compareTo(stockNuevo) != 0) {
                    
                    plato.setStockDisponible(stockNuevo);
                    platoRepository.save(plato);
                    
                    boolean stockBajo = stockNuevo != null && 
                        stockNuevo.compareTo(new BigDecimal(5)) <= 0;
                    
                    Map<String, Object> eventData = new HashMap<>();
                    eventData.put("platoId", plato.getPlatoId());
                    eventData.put("nombre", plato.getNombre());
                    eventData.put("stockDisponible", stockNuevo);
                    eventData.put("stockBajo", stockBajo);
                    eventData.put("tipo", "STOCK_UPDATED");
                    
                    sseEmitterManager.broadcast("carta.plato_stock_changed", eventData);
                    log.info("[SSE] Emitido carta.plato_stock_changed para plato {} (stock: {})", 
                        plato.getPlatoId(), stockNuevo);
                }
            }
        }
    }

    @Transactional
    public CartaTipoCartaOperativo actualizarTipoCarta(UUID tipoCartaId, String nombre,
                                                        LocalTime horaInicio, LocalTime horaFin,
                                                        Boolean activo, List<PlatoInfoSyncDto> platos) {
        Optional<CartaTipoCartaOperativo> tipoOpt = tipoCartaRepository.findByTipoCartaId(tipoCartaId);
        
        CartaTipoCartaOperativo tipoCarta;
        if (tipoOpt.isPresent()) {
            tipoCarta = tipoOpt.get();
            log.info("Actualizando tipo de carta existente: {}", tipoCartaId);
        } else {
            tipoCarta = new CartaTipoCartaOperativo();
            tipoCarta.setTipoCartaId(tipoCartaId);
            log.info("Creando nuevo tipo de carta: {}", tipoCartaId);
        }

        tipoCarta.setNombre(nombre);
        tipoCarta.setHoraInicio(horaInicio);
        tipoCarta.setHoraFin(horaFin);
        tipoCarta.setActivo(activo != null ? activo : true);
        tipoCarta.setFechaSincronizacion(OffsetDateTime.now());

        CartaTipoCartaOperativo saved = tipoCartaRepository.save(tipoCarta);
        
        sincronizarPlatosTipoCarta(tipoCartaId, platos);

        Map<String, Object> eventData = new HashMap<>();
        eventData.put("tipoCartaId", tipoCartaId);
        eventData.put("nombre", nombre);
        eventData.put("horaInicio", horaInicio != null ? horaInicio.toString() : null);
        eventData.put("horaFin", horaFin != null ? horaFin.toString() : null);
        eventData.put("activo", activo);
        eventData.put("tipo", "TIPO_CARTA_UPDATED");
        
        sseEmitterManager.broadcast("carta.tipo_carta_updated", eventData);
        log.info("[SSE] Emitido carta.tipo_carta_updated para tipo {}", tipoCartaId);

        return saved;
    }

    @Transactional
    public void eliminarPlatoDeTipoCarta(UUID tipoCartaId, UUID platoId) {
        tipoCartaPlatoRepository.deleteByTipoCartaIdAndPlatoId(tipoCartaId, platoId);
        
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("tipoCartaId", tipoCartaId);
        eventData.put("platoId", platoId);
        eventData.put("tipo", "PLATO_REMOVED_FROM_CARTA");
        
        sseEmitterManager.broadcast("carta.tipo_carta_updated", eventData);
        log.info("[SSE] Emitido carta.tipo_carta_updated para eliminación de plato {} de tipo {}", 
            platoId, tipoCartaId);
    }

    @Transactional
    public void agregarPlatoATipoCarta(UUID tipoCartaId, UUID platoId, Integer orden) {
        Optional<CartaTipoCartaPlatoOperativo> existente = 
            tipoCartaPlatoRepository.findByTipoCartaIdAndPlatoId(tipoCartaId, platoId);
        
        if (existente.isEmpty()) {
            CartaTipoCartaPlatoOperativo relacion = new CartaTipoCartaPlatoOperativo();
            relacion.setTipoCartaId(tipoCartaId);
            relacion.setPlatoId(platoId);
            relacion.setOrden(orden != null ? orden : 0);
            tipoCartaPlatoRepository.save(relacion);
            
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("tipoCartaId", tipoCartaId);
            eventData.put("platoId", platoId);
            eventData.put("orden", orden);
            eventData.put("tipo", "PLATO_ADDED_TO_CARTA");
            
            sseEmitterManager.broadcast("carta.tipo_carta_updated", eventData);
            log.info("[SSE] Emitido carta.tipo_carta_updated para agregar plato {} a tipo {}", 
                platoId, tipoCartaId);
        }
    }
}
