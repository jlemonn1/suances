package com.suances.sala.service;

import com.suances.sala.client.ReservasRestClient;
import com.suances.sala.client.dto.FranjaResponse;
import com.suances.sala.client.dto.SalaResponse;
import com.suances.sala.domain.model.FranjaOperativa;
import com.suances.sala.domain.model.SalaOperativa;
import com.suances.sala.repository.FranjaOperativaRepository;
import com.suances.sala.repository.SalaOperativaRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class SincronizacionCatalogoService {

    private static final Logger log = LoggerFactory.getLogger(SincronizacionCatalogoService.class);

    private final ReservasRestClient reservasRestClient;
    private final FranjaOperativaRepository franjaOperativaRepository;
    private final SalaOperativaRepository salaOperativaRepository;

    @Value("${app.sincronizacion.hora:0 0 9 * * *}")
    private String horaSincronizacion;

    public SincronizacionCatalogoService(ReservasRestClient reservasRestClient,
                                         FranjaOperativaRepository franjaOperativaRepository,
                                         SalaOperativaRepository salaOperativaRepository) {
        this.reservasRestClient = reservasRestClient;
        this.franjaOperativaRepository = franjaOperativaRepository;
        this.salaOperativaRepository = salaOperativaRepository;
    }

    @PostConstruct
    public void sincronizarAlIniciar() {
        log.info("Iniciando sincronización de catálogo al arrancar el servicio...");
        try {
            sincronizarTodo();
            log.info("Sincronización inicial de catálogo completada.");
        } catch (Exception e) {
            log.error("Error en sincronización inicial de catálogo: {}", e.getMessage(), e);
        }
    }

    @Scheduled(cron = "${app.sincronizacion.hora:0 0 9 * * *}")
    public void sincronizacionProgramada() {
        log.info("Ejecutando sincronización programada de catálogo a las 9:00 AM...");
        try {
            sincronizarTodo();
        } catch (Exception e) {
            log.error("Error en sincronización programada: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void sincronizarTodo() {
        log.info("Iniciando sincronización completa de catálogo...");
        LocalDate fechaHoy = LocalDate.now();
        
        sincronizarFranjas(fechaHoy);
        sincronizarSalas(fechaHoy);
        
        // Limpiar datos antiguos (más de 1 día)
        limpiarDatosAntiguos(fechaHoy.minusDays(1));
        
        log.info("Sincronización de catálogo completada para fecha: {}", fechaHoy);
    }

    @Transactional
    public void sincronizarFranjas(LocalDate fecha) {
        log.info("Sincronizando franjas desde reservas-service...");
        
        List<FranjaResponse> franjas = reservasRestClient.obtenerFranjas();
        
        if (franjas.isEmpty()) {
            log.warn("No se obtuvieron franjas del servicio de reservas");
            return;
        }

        AtomicInteger actualizadas = new AtomicInteger(0);
        AtomicInteger creadas = new AtomicInteger(0);

        franjas.forEach(franjaDto -> {
            Optional<FranjaOperativa> franjaOpt = franjaOperativaRepository.findById(franjaDto.id());
            
            if (franjaOpt.isPresent()) {
                actualizarFranjaExistente(franjaOpt.get(), franjaDto, fecha);
                actualizadas.incrementAndGet();
            } else {
                crearNuevaFranja(franjaDto, fecha);
                creadas.incrementAndGet();
            }
        });

        log.info("Franjas sincronizadas. Actualizadas: {}, Creadas: {}", 
                actualizadas.get(), creadas.get());
    }

    @Transactional
    public void sincronizarSalas(LocalDate fecha) {
        log.info("Sincronizando salas desde reservas-service...");
        
        List<SalaResponse> salas = reservasRestClient.obtenerSalas();
        
        if (salas.isEmpty()) {
            log.warn("No se obtuvieron salas del servicio de reservas");
            return;
        }

        AtomicInteger actualizadas = new AtomicInteger(0);
        AtomicInteger creadas = new AtomicInteger(0);
        AtomicInteger orden = new AtomicInteger(0);

        salas.forEach(salaDto -> {
            Optional<SalaOperativa> salaOpt = salaOperativaRepository.findById(salaDto.id());
            
            if (salaOpt.isPresent()) {
                actualizarSalaExistente(salaOpt.get(), salaDto, fecha);
                actualizadas.incrementAndGet();
            } else {
                crearNuevaSala(salaDto, fecha, orden.getAndIncrement());
                creadas.incrementAndGet();
            }
        });

        log.info("Salas sincronizadas. Actualizadas: {}, Creadas: {}", 
                actualizadas.get(), creadas.get());
    }

    private void actualizarFranjaExistente(FranjaOperativa franja, FranjaResponse dto, LocalDate fecha) {
        franja.setNombre(dto.nombre());
        franja.setTipo(dto.tipo());
        franja.setHoraInicio(dto.horaInicio());
        franja.setHoraFin(dto.horaFin());
        franja.setActiva(dto.activa());
        franja.setFechaSincronizacion(fecha);
        franjaOperativaRepository.save(franja);
    }

    private void crearNuevaFranja(FranjaResponse dto, LocalDate fecha) {
        FranjaOperativa franja = new FranjaOperativa();
        franja.setId(dto.id());
        franja.setNombre(dto.nombre());
        franja.setTipo(dto.tipo());
        franja.setHoraInicio(dto.horaInicio());
        franja.setHoraFin(dto.horaFin());
        franja.setActiva(dto.activa());
        franja.setFechaSincronizacion(fecha);
        franjaOperativaRepository.save(franja);
        log.debug("Creada nueva franja operativa: {} (ID: {})", franja.getNombre(), franja.getId());
    }

    private void actualizarSalaExistente(SalaOperativa sala, SalaResponse dto, LocalDate fecha) {
        sala.setNombre(dto.nombre());
        sala.setCapacidadMaxima(dto.capacidadMaxima());
        sala.setLayoutJson(dto.layoutJson());
        sala.setActiva(dto.activa());
        sala.setFechaSincronizacion(fecha);
        salaOperativaRepository.save(sala);
    }

    private void crearNuevaSala(SalaResponse dto, LocalDate fecha, int orden) {
        SalaOperativa sala = new SalaOperativa();
        sala.setId(dto.id());
        sala.setNombre(dto.nombre());
        sala.setCapacidadMaxima(dto.capacidadMaxima());
        sala.setLayoutJson(dto.layoutJson());
        sala.setActiva(dto.activa());
        sala.setOrden(orden);
        sala.setFechaSincronizacion(fecha);
        salaOperativaRepository.save(sala);
        log.debug("Creada nueva sala operativa: {} (ID: {})", sala.getNombre(), sala.getId());
    }

    private void limpiarDatosAntiguos(LocalDate fechaLimite) {
        log.info("Limpiando datos antiguos anteriores a: {}", fechaLimite);
        franjaOperativaRepository.deleteByFechaSincronizacionBefore(fechaLimite);
        salaOperativaRepository.deleteByFechaSincronizacionBefore(fechaLimite);
        log.info("Limpieza de datos antiguos completada");
    }
}
