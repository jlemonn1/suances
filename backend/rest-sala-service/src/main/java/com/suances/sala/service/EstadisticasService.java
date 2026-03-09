package com.suances.sala.service;

import com.suances.sala.domain.model.Comanda;
import com.suances.sala.domain.model.enums.ComandaEstado;
import com.suances.sala.repository.ComandaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EstadisticasService {

    private final ComandaRepository comandaRepository;

    public EstadisticasService(ComandaRepository comandaRepository) {
        this.comandaRepository = comandaRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obtenerResumenDelDia(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);

        List<Comanda> comandasDelDia = comandaRepository.findAll().stream()
                .filter(c -> c.getFechaApertura().isAfter(inicio.atOffset(ZoneOffset.UTC)) && 
                            c.getFechaApertura().isBefore(fin.atOffset(ZoneOffset.UTC)))
                .toList();

        long totalComandas = comandasDelDia.size();
        long abiertas = comandasDelDia.stream().filter(c -> c.getEstado() == ComandaEstado.ABIERTA).count();
        long enPreparacion = comandasDelDia.stream().filter(c -> c.getEstado() == ComandaEstado.EN_PREPARACION).count();
        long servidas = comandasDelDia.stream().filter(c -> c.getEstado() == ComandaEstado.SERVIDA).count();
        long enCuenta = comandasDelDia.stream().filter(c -> c.getEstado() == ComandaEstado.CUENTA).count();
        long cobradas = comandasDelDia.stream().filter(c -> c.getEstado() == ComandaEstado.COBRADA).count();
        long canceladas = comandasDelDia.stream().filter(c -> c.getEstado() == ComandaEstado.CANCELADA).count();

        BigDecimal ventasTotales = comandasDelDia.stream()
                .filter(c -> c.getEstado() == ComandaEstado.COBRADA)
                .map(Comanda::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("fecha", fecha.toString());
        resumen.put("comandas", Map.of(
                "total", totalComandas,
                "abiertas", abiertas,
                "enPreparacion", enPreparacion,
                "servidas", servidas,
                "enCuenta", enCuenta,
                "cobradas", cobradas,
                "canceladas", canceladas
        ));
        resumen.put("ventas", Map.of(
                "total", ventasTotales,
                "promedioPorComanda", cobradas > 0 ? ventasTotales.divide(BigDecimal.valueOf(cobradas), 2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO
        ));

        return resumen;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerRendimientoPorCamarero(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);

        List<Comanda> comandasDelDia = comandaRepository.findAll().stream()
                .filter(c -> c.getFechaApertura().isAfter(inicio.atOffset(ZoneOffset.UTC)) && 
                            c.getFechaApertura().isBefore(fin.atOffset(ZoneOffset.UTC)))
                .toList();

        Map<UUID, List<Comanda>> comandasPorCamarero = comandasDelDia.stream()
                .collect(Collectors.groupingBy(Comanda::getCamareroId));

        return comandasPorCamarero.entrySet().stream()
                .map(entry -> {
                    UUID camareroId = entry.getKey();
                    List<Comanda> comandas = entry.getValue();
                    
                    long totalComandas = comandas.size();
                    long comandasCobradas = comandas.stream()
                            .filter(c -> c.getEstado() == ComandaEstado.COBRADA)
                            .count();
                    BigDecimal ventasGeneradas = comandas.stream()
                            .filter(c -> c.getEstado() == ComandaEstado.COBRADA)
                            .map(Comanda::getTotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    Map<String, Object> stats = new HashMap<>();
                    stats.put("camareroId", camareroId.toString());
                    stats.put("camareroNombre", "Camarero " + camareroId.toString().substring(0, 8));
                    stats.put("comandasAtendidas", totalComandas);
                    stats.put("comandasCobradas", comandasCobradas);
                    stats.put("ventasGeneradas", ventasGeneradas);
                    
                    return stats;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticasMesas(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);

        List<Comanda> comandasCobradas = comandaRepository.findAll().stream()
                .filter(c -> c.getEstado() == ComandaEstado.COBRADA)
                .filter(c -> c.getFechaApertura().isAfter(inicio.atOffset(ZoneOffset.UTC)) && 
                            c.getFechaApertura().isBefore(fin.atOffset(ZoneOffset.UTC)))
                .toList();

        // Calcular tiempo promedio de ocupación
        double tiempoPromedioMinutos = comandasCobradas.stream()
                .filter(c -> c.getFechaCierre() != null)
                .mapToLong(c -> java.time.Duration.between(
                        c.getFechaApertura(), 
                        c.getFechaCierre()
                ).toMinutes())
                .average()
                .orElse(0.0);

        // Calcular rotación (cuántas comandas por mesa en promedio)
        Map<UUID, Long> comandasPorMesa = comandasCobradas.stream()
                .collect(Collectors.groupingBy(Comanda::getMesaId, Collectors.counting()));

        double rotacionPromedio = comandasPorMesa.isEmpty() ? 0.0 : 
                comandasPorMesa.values().stream()
                        .mapToLong(Long::longValue)
                        .average()
                        .orElse(0.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("fecha", fecha.toString());
        stats.put("totalComandasCobradas", comandasCobradas.size());
        stats.put("tiempoPromedioOcupacionMinutos", Math.round(tiempoPromedioMinutos));
        stats.put("rotacionPromedioPorMesa", Math.round(rotacionPromedio * 100.0) / 100.0);
        
        return stats;
    }
}
