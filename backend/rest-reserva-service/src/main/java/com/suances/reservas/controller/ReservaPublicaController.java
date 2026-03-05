package com.suances.reservas.controller;

import com.suances.reservas.dto.DisponibilidadResponse;
import com.suances.reservas.dto.ReservaPublicaRequest;
import com.suances.reservas.dto.ReservaResponse;
import com.suances.reservas.service.ReservaPublicaService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/public/reservas")
public class ReservaPublicaController {

    private final ReservaPublicaService reservaPublicaService;

    public ReservaPublicaController(ReservaPublicaService reservaPublicaService) {
        this.reservaPublicaService = reservaPublicaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaResponse crear(@Valid @RequestBody ReservaPublicaRequest request) {
        return reservaPublicaService.crearReservaOnline(request);
    }

    @GetMapping("/{codigo}")
    public ReservaResponse consultar(@PathVariable String codigo) {
        return reservaPublicaService.consultarPorCodigo(codigo);
    }

    @PostMapping("/consultar")
    public List<DisponibilidadResponse> consultarDisponibilidad(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return reservaPublicaService.consultarDisponibilidad(fecha);
    }
}
