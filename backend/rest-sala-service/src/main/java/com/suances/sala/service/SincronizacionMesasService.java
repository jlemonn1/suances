package com.suances.sala.service;

import com.suances.sala.client.ReservasRestClient;
import com.suances.sala.domain.model.MesaOperativa;
import com.suances.sala.domain.model.enums.MesaEstadoOperativo;
import com.suances.sala.dto.MesaEstadoDto;
import com.suances.sala.repository.MesaOperativaRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SincronizacionMesasService {

    private static final Logger log = LoggerFactory.getLogger(SincronizacionMesasService.class);

    private final ReservasRestClient reservasRestClient;
    private final MesaOperativaRepository mesaOperativaRepository;

    public SincronizacionMesasService(ReservasRestClient reservasRestClient,
                                     MesaOperativaRepository mesaOperativaRepository) {
        this.reservasRestClient = reservasRestClient;
        this.mesaOperativaRepository = mesaOperativaRepository;
    }

    @PostConstruct
    public void sincronizarAlIniciar() {
        log.info("Iniciando sincronización de mesas al arrancar el servicio...");
        try {
            // Sincronizar para el día actual sin franja específica (trae todas las mesas)
            sincronizarMesasSinFranja(LocalDate.now());
            log.info("Sincronización inicial completada.");
        } catch (Exception e) {
            log.error("Error en sincronización inicial: {}", e.getMessage(), e);
        }
    }
    
    @Transactional
    public void sincronizarMesasSinFranja(LocalDate fecha) {
        log.info("Sincronizando mesas para fecha {} (sin franja específica)", fecha);
        
        // Llamar al endpoint sin franjaId para obtener todas las mesas
        List<MesaEstadoDto> mesasEstado = reservasRestClient.obtenerEstadoMesasSinFranja(fecha);
        
        if (mesasEstado.isEmpty()) {
            log.warn("No se obtuvieron mesas del servicio de reservas");
            return;
        }

        int actualizadas = 0;
        int creadas = 0;

        for (MesaEstadoDto mesaDto : mesasEstado) {
            Optional<MesaOperativa> mesaOpt = mesaOperativaRepository.findById(mesaDto.getMesaId());
            
            if (mesaOpt.isPresent()) {
                actualizarMesaExistente(mesaOpt.get(), mesaDto, fecha);
                actualizadas++;
            } else {
                crearNuevaMesa(mesaDto, fecha);
                creadas++;
            }
        }

        log.info("Sincronización completada. Mesas actualizadas: {}, creadas: {}", actualizadas, creadas);
    }

    @Scheduled(cron = "0 0 9 * * ?") // Todos los días a las 9:00 AM
    public void sincronizacionDiaria() {
        log.info("Ejecutando sincronización diaria a las 9:00 AM...");
        try {
            sincronizarMesasSinFranja(LocalDate.now());
        } catch (Exception e) {
            log.error("Error en sincronización diaria: {}", e.getMessage());
        }
    }

    @Transactional
    public void sincronizarMesas(LocalDate fecha, UUID franjaId) {
        log.info("Sincronizando mesas para fecha {} y franja {}", fecha, franjaId);
        
        List<MesaEstadoDto> mesasEstado = reservasRestClient.obtenerEstadoMesas(fecha, franjaId);
        
        if (mesasEstado.isEmpty()) {
            log.warn("No se obtuvieron mesas del servicio de reservas");
            return;
        }

        int actualizadas = 0;
        int creadas = 0;

        for (MesaEstadoDto mesaDto : mesasEstado) {
            Optional<MesaOperativa> mesaOpt = mesaOperativaRepository.findById(mesaDto.getMesaId());
            
            if (mesaOpt.isPresent()) {
                actualizarMesaExistente(mesaOpt.get(), mesaDto, fecha);
                actualizadas++;
            } else {
                crearNuevaMesa(mesaDto, fecha);
                creadas++;
            }
        }

        log.info("Sincronización completada. Mesas actualizadas: {}, creadas: {}", actualizadas, creadas);
    }

    private void actualizarMesaExistente(MesaOperativa mesa, MesaEstadoDto mesaDto, LocalDate fecha) {
        mesa.setNumero(mesaDto.getNumero());
        mesa.setCapacidad(mesaDto.getCapacidad());
        mesa.setSalaId(mesaDto.getSalaId());
        
        // Solo actualizar reserva si la mesa no está ocupada por una comanda
        if (mesa.getEstadoOperativo() != MesaEstadoOperativo.OCUPADA &&
            mesa.getEstadoOperativo() != MesaEstadoOperativo.PIDIENDO &&
            mesa.getEstadoOperativo() != MesaEstadoOperativo.SERVIDA &&
            mesa.getEstadoOperativo() != MesaEstadoOperativo.CUENTA) {
            
            if (mesaDto.getEstado() == MesaEstadoDto.MesaEstado.RESERVADA && mesaDto.getReservaInfo() != null) {
                mesa.setReservaActualId(mesaDto.getReservaInfo().getReservaId());
                mesa.setNombreClienteReserva(mesaDto.getReservaInfo().getNombreCliente());
                mesa.setFranjaIdReserva(mesaDto.getReservaInfo().getFranjaId());
                mesa.setFechaReserva(mesaDto.getReservaInfo().getFecha() != null ? 
                    mesaDto.getReservaInfo().getFecha() : fecha);
            } else if (mesaDto.getEstado() == MesaEstadoDto.MesaEstado.LIBRE) {
                mesa.setReservaActualId(null);
                mesa.setNombreClienteReserva(null);
                mesa.setFranjaIdReserva(null);
                mesa.setFechaReserva(null);
            }
        }
        
        mesaOperativaRepository.save(mesa);
    }

    private void crearNuevaMesa(MesaEstadoDto mesaDto, LocalDate fecha) {
        MesaOperativa mesa = new MesaOperativa();
        mesa.setId(mesaDto.getMesaId());
        mesa.setNumero(mesaDto.getNumero());
        mesa.setCapacidad(mesaDto.getCapacidad());
        mesa.setSalaId(mesaDto.getSalaId());
        mesa.setEstadoOperativo(MesaEstadoOperativo.LIBRE);
        
        if (mesaDto.getEstado() == MesaEstadoDto.MesaEstado.RESERVADA && mesaDto.getReservaInfo() != null) {
            mesa.setReservaActualId(mesaDto.getReservaInfo().getReservaId());
            mesa.setNombreClienteReserva(mesaDto.getReservaInfo().getNombreCliente());
            mesa.setFranjaIdReserva(mesaDto.getReservaInfo().getFranjaId());
            mesa.setFechaReserva(mesaDto.getReservaInfo().getFecha() != null ? 
                mesaDto.getReservaInfo().getFecha() : fecha);
        }
        
        mesaOperativaRepository.save(mesa);
        log.info("Creada nueva mesa operativa: {} (ID: {})", mesa.getNumero(), mesa.getId());
    }
}
