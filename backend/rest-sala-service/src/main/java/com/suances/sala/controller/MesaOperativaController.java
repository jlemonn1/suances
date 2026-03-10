package com.suances.sala.controller;

import com.suances.sala.domain.dto.response.MesaOperativaResponse;
import com.suances.sala.domain.model.FranjaOperativa;
import com.suances.sala.domain.model.SalaOperativa;
import com.suances.sala.domain.model.enums.MesaEstadoOperativo;
import com.suances.sala.event.SseEmitterManager;
import com.suances.sala.repository.FranjaOperativaRepository;
import com.suances.sala.repository.SalaOperativaRepository;
import com.suances.sala.service.MesaOperativaService;
import com.suances.sala.service.SincronizacionCatalogoService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/mesas")
public class MesaOperativaController {

    private final MesaOperativaService mesaOperativaService;
    private final SseEmitterManager sseEmitterManager;
    private final FranjaOperativaRepository franjaOperativaRepository;
    private final SalaOperativaRepository salaOperativaRepository;
    private final SincronizacionCatalogoService sincronizacionCatalogoService;

    public MesaOperativaController(MesaOperativaService mesaOperativaService,
                                   SseEmitterManager sseEmitterManager,
                                   FranjaOperativaRepository franjaOperativaRepository,
                                   SalaOperativaRepository salaOperativaRepository,
                                   SincronizacionCatalogoService sincronizacionCatalogoService) {
        this.mesaOperativaService = mesaOperativaService;
        this.sseEmitterManager = sseEmitterManager;
        this.franjaOperativaRepository = franjaOperativaRepository;
        this.salaOperativaRepository = salaOperativaRepository;
        this.sincronizacionCatalogoService = sincronizacionCatalogoService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<Map<String, Object>> listar(
            @RequestParam(required = false) UUID salaId,
            @RequestParam(required = false) MesaEstadoOperativo estado,
            @RequestParam(required = false) UUID franjaId) {
        List<MesaOperativaResponse> mesas = mesaOperativaService.listarMesas(salaId, estado, franjaId);
        
        // Calcular resumen (using record accessor methods)
        long libres = mesas.stream().filter(m -> m.estadoOperativo() == MesaEstadoOperativo.LIBRE && m.reservaActualId() == null).count();
        long ocupadas = mesas.stream().filter(m -> m.estadoOperativo() != MesaEstadoOperativo.LIBRE).count();
        long reservadas = mesas.stream().filter(m -> m.reservaActualId() != null).count();
        
        Map<String, Object> resumen = new HashMap<>();
        resumen.put("totalMesas", mesas.size());
        resumen.put("libres", (int) libres);
        resumen.put("ocupadas", (int) ocupadas);
        resumen.put("reservadas", (int) reservadas);
        
        Map<String, Object> response = new HashMap<>();
        response.put("mesas", mesas);
        response.put("resumen", resumen);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public MesaOperativaResponse obtener(@PathVariable UUID id) {
        return mesaOperativaService.obtenerMesa(id);
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<Void> cambiarEstado(
            @PathVariable UUID id,
            @RequestParam MesaEstadoOperativo estado,
            @RequestParam(required = false) UUID comandaId) {
        mesaOperativaService.actualizarEstadoMesa(id, estado, comandaId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/asignar-camarero")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<Void> asignarCamarero(
            @PathVariable UUID id,
            @RequestParam UUID camareroId) {
        mesaOperativaService.asignarCamarero(id, camareroId);
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> events() {
        return ResponseEntity.ok(sseEmitterManager.addEmitter());
    }

    @GetMapping("/franjas")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<List<FranjaOperativa>> getFranjas() {
        // Solo devolver franjas del día actual
        LocalDate hoy = LocalDate.now();
        List<FranjaOperativa> franjasHoy = franjaOperativaRepository.findAll().stream()
            .filter(f -> f.getFechaSincronizacion() != null && f.getFechaSincronizacion().equals(hoy))
            .collect(Collectors.toList());
        return ResponseEntity.ok(franjasHoy);
    }

    @GetMapping("/salas")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<List<SalaOperativa>> getSalas() {
        return ResponseEntity.ok(salaOperativaRepository.findAll());
    }

    @PostMapping("/sincronizar-todo")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER','WAITER')")
    public ResponseEntity<String> sincronizarTodo() {
        sincronizacionCatalogoService.sincronizarTodo();
        return ResponseEntity.ok("Sincronización completada");
    }
}
