package com.suances.sala.client;

import com.suances.sala.client.dto.ComandaReservaRequest;
import com.suances.sala.client.dto.FranjaResponse;
import com.suances.sala.client.dto.ReservaResponseDto;
import com.suances.sala.client.dto.SalaResponse;
import com.suances.sala.dto.MesaEstadoDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
public class ReservasRestClient {

    private static final Logger log = LoggerFactory.getLogger(ReservasRestClient.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final String SERVICE_TOKEN_HEADER = "X-Service-Token";

    @Value("${app.reservas.url:http://localhost:8087/api/reservas}")
    private String reservasUrl;

    @Value("${app.service.token:}")
    private String serviceToken;

    private final RestTemplate restTemplate;

    public ReservasRestClient() {
        this.restTemplate = new RestTemplate();
    }

    public List<MesaEstadoDto> obtenerEstadoMesas(LocalDate fecha, UUID franjaId) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl(reservasUrl + "/mesas/estado-diario")
                    .queryParam("fecha", fecha.format(DATE_FORMATTER))
                    .queryParam("franjaId", franjaId.toString())
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set(SERVICE_TOKEN_HEADER, serviceToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            log.info("Consultando estado de mesas en reservas para fecha {} y franja {}", fecha, franjaId);

            ResponseEntity<List<MesaEstadoDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<MesaEstadoDto>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Obtenidas {} mesas del servicio de reservas", response.getBody().size());
                return response.getBody();
            } else {
                log.warn("Respuesta no exitosa del servicio de reservas: {}", response.getStatusCode());
                return Collections.emptyList();
            }
        } catch (Exception e) {
            log.error("Error al consultar estado de mesas en reservas", e);
            return Collections.emptyList();
        }
    }

    public List<MesaEstadoDto> obtenerEstadoMesasSinFranja(LocalDate fecha) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl(reservasUrl + "/mesas/estado-diario")
                    .queryParam("fecha", fecha.format(DATE_FORMATTER))
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set(SERVICE_TOKEN_HEADER, serviceToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            log.info("Consultando estado de mesas en reservas para fecha {} (sin franja)", fecha);

            ResponseEntity<List<MesaEstadoDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<MesaEstadoDto>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Obtenidas {} mesas del servicio de reservas", response.getBody().size());
                return response.getBody();
            } else {
                log.warn("Respuesta no exitosa del servicio de reservas: {}", response.getStatusCode());
                return Collections.emptyList();
            }
        } catch (Exception e) {
            log.error("Error al consultar estado de mesas en reservas", e);
            return Collections.emptyList();
        }
    }

    public List<FranjaResponse> obtenerFranjas() {
        try {
            String url = reservasUrl + "/franjas";

            HttpHeaders headers = new HttpHeaders();
            headers.set(SERVICE_TOKEN_HEADER, serviceToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            log.info("Consultando franjas horarias en reservas");

            ResponseEntity<List<FranjaResponse>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<FranjaResponse>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Obtenidas {} franjas del servicio de reservas", response.getBody().size());
                return response.getBody();
            } else {
                log.warn("Respuesta no exitosa del servicio de reservas: {}", response.getStatusCode());
                return Collections.emptyList();
            }
        } catch (Exception e) {
            log.error("Error al consultar franjas en reservas", e);
            return Collections.emptyList();
        }
    }

    public List<SalaResponse> obtenerSalas() {
        try {
            String url = reservasUrl + "/salas";

            HttpHeaders headers = new HttpHeaders();
            headers.set(SERVICE_TOKEN_HEADER, serviceToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            log.info("Consultando salas en reservas");

            ResponseEntity<List<SalaResponse>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<SalaResponse>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Obtenidas {} salas del servicio de reservas", response.getBody().size());
                return response.getBody();
            } else {
                log.warn("Respuesta no exitosa del servicio de reservas: {}", response.getStatusCode());
                return Collections.emptyList();
            }
        } catch (Exception e) {
            log.error("Error al consultar salas en reservas", e);
            return Collections.emptyList();
        }
    }

    public ReservaResponseDto crearReservaDesdeComanda(ComandaReservaRequest request) {
        try {
            String url = reservasUrl + "/reservas/comanda";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set(SERVICE_TOKEN_HEADER, serviceToken);
            
            HttpEntity<ComandaReservaRequest> entity = new HttpEntity<>(request, headers);

            log.info("Creando reserva desde comanda para mesa {} en sala {}", request.mesaId(), request.salaId());

            ResponseEntity<ReservaResponseDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    ReservaResponseDto.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Reserva creada exitosamente: codigo={}", response.getBody().codigo());
                return response.getBody();
            } else {
                log.warn("Respuesta no exitosa al crear reserva desde comanda: {}", response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            log.error("Error al crear reserva desde comanda", e);
            return null;
        }
    }
}
