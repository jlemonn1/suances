package com.suances.sala.controller;

import com.suances.sala.domain.dto.response.IngredienteOperativoResponse;
import com.suances.sala.domain.dto.response.IngredienteStockBajoResponse;
import com.suances.sala.domain.dto.response.PlatoOperativoResponse;
import com.suances.sala.domain.dto.response.TipoCartaOperativoResponse;
import com.suances.sala.domain.model.CartaIngredienteOperativo;
import com.suances.sala.domain.model.CartaPlatoIngredienteOperativo;
import com.suances.sala.domain.model.CartaPlatoOperativo;
import com.suances.sala.domain.model.CartaTipoCartaOperativo;
import com.suances.sala.event.SseEmitterManager;
import com.suances.sala.service.CartaSyncService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/carta")
public class CartaOperativaController {

    private final CartaSyncService cartaSyncService;
    private final SseEmitterManager sseEmitterManager;

    public CartaOperativaController(CartaSyncService cartaSyncService, SseEmitterManager sseEmitterManager) {
        this.cartaSyncService = cartaSyncService;
        this.sseEmitterManager = sseEmitterManager;
    }

    @GetMapping("/platos")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public List<PlatoOperativoResponse> listarPlatosDisponibles() {
        return cartaSyncService.obtenerPlatosDisponibles().stream()
                .map(this::mapToPlatoResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/platos/{platoId}")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public PlatoOperativoResponse obtenerPlato(@PathVariable UUID platoId) {
        Optional<CartaPlatoOperativo> platoOpt = cartaSyncService.obtenerPlato(platoId);
        return platoOpt.map(this::mapToPlatoResponse)
                .orElseThrow(() -> new RuntimeException("Plato no encontrado: " + platoId));
    }

    @GetMapping("/platos/{platoId}/ingredientes")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public List<String> obtenerIngredientesPlato(@PathVariable UUID platoId) {
        return cartaSyncService.obtenerIngredientesPlato(platoId).stream()
                .map(CartaPlatoIngredienteOperativo::getIngredienteNombre)
                .collect(Collectors.toList());
    }

    @GetMapping("/platos/stock-bajo")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public List<PlatoOperativoResponse> listarPlatosStockBajo(@RequestParam(defaultValue = "5") Integer umbral) {
        return cartaSyncService.obtenerPlatosConStockBajo(umbral).stream()
                .map(this::mapToPlatoResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/platos/stock-bajo-afectados")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public List<PlatoOperativoResponse> listarPlatosStockBajoAfectados() {
        return cartaSyncService.obtenerPlatosConStockBajoFlag().stream()
                .map(this::mapToPlatoResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/ingredientes")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public List<IngredienteOperativoResponse> listarIngredientes() {
        // Este endpoint debería devolver ingredientes reales, no platos
        // Por ahora devolvemos lista vacía o implementamos lógica para obtener ingredientes únicos
        return List.of();
    }

    @GetMapping("/tipos-carta")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public List<TipoCartaOperativoResponse> listarTiposCarta() {
        return cartaSyncService.obtenerTiposCartaActivos().stream()
                .map(this::mapToTipoCartaResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/tipos-carta/activa")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public List<TipoCartaOperativoResponse> obtenerCartaActivaPorHora() {
        return cartaSyncService.obtenerCartaActivaPorHora().stream()
                .map(this::mapToTipoCartaResponse)
                .collect(Collectors.toList());
    }

    @PostMapping("/sync")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public String sincronizarCarta() {
        cartaSyncService.sincronizarCartaCompleta();
        return "Sincronización de carta iniciada";
    }

    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> events() {
        return ResponseEntity.ok(sseEmitterManager.addEmitter());
    }

    private PlatoOperativoResponse mapToPlatoResponse(CartaPlatoOperativo plato) {
        // Usar el flag persistido de stockBajo (actualizado por eventos de carta-service)
        Boolean stockBajo = plato.getStockBajo() != null ? plato.getStockBajo() : false;
        
        // Obtener ingredientes del plato
        List<String> ingredientes = cartaSyncService.obtenerIngredientesPlato(plato.getPlatoId()).stream()
                .map(CartaPlatoIngredienteOperativo::getIngredienteNombre)
                .collect(Collectors.toList());
        
        // Obtener ingredientes con stock bajo del plato
        List<IngredienteStockBajoResponse> ingredientesBajos = cartaSyncService.obtenerIngredientesBajosPlato(plato.getPlatoId()).stream()
                .map(i -> new IngredienteStockBajoResponse(
                        i.getIngredienteId(),
                        i.getNombre(),
                        i.getStockActual(),
                        i.getUmbralAlerta(),
                        i.getUnidadMedida().name()
                ))
                .collect(Collectors.toList());
        
        return new PlatoOperativoResponse(
                plato.getPlatoId(),
                plato.getNombre(),
                plato.getDescripcion(),
                plato.getPrecioVenta(),
                plato.getCategoriaId(),
                plato.getCategoriaNombre(),
                plato.getStockDisponible(),
                plato.getDisponible(),
                stockBajo,
                plato.getImagenUrl(),
                ingredientes,
                ingredientesBajos
        );
    }

    private TipoCartaOperativoResponse mapToTipoCartaResponse(CartaTipoCartaOperativo tipoCarta) {
        // Obtener platos reales desde la tabla intermedia
        List<PlatoOperativoResponse> platos = cartaSyncService.obtenerPlatosPorTipoCarta(tipoCarta.getTipoCartaId()).stream()
                .map(this::mapToPlatoResponse)
                .collect(Collectors.toList());
        
        return new TipoCartaOperativoResponse(
                tipoCarta.getTipoCartaId(),
                tipoCarta.getNombre(),
                tipoCarta.getHoraInicio(),
                tipoCarta.getHoraFin(),
                tipoCarta.getActivo(),
                platos
        );
    }
}
