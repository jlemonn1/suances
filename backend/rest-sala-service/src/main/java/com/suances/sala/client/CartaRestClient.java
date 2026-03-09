package com.suances.sala.client;

import com.suances.sala.client.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
public class CartaRestClient {

    private static final Logger log = LoggerFactory.getLogger(CartaRestClient.class);
    private static final String SERVICE_TOKEN_HEADER = "X-Service-Token";

    @Value("${app.carta.url:http://localhost:8081/api/carta}")
    private String cartaUrl;

    @Value("${app.service.token:}")
    private String serviceToken;

    private final RestTemplate restTemplate;

    public CartaRestClient() {
        this.restTemplate = new RestTemplate();
    }

    public List<PlatoSyncDto> obtenerPlatos() {
        try {
            String url = cartaUrl + "/platos?activo=true";

            HttpHeaders headers = new HttpHeaders();
            headers.set(SERVICE_TOKEN_HEADER, serviceToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            log.info("Consultando platos activos en carta-service");

            ResponseEntity<List<PlatoSyncDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<PlatoSyncDto>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Obtenidos {} platos del servicio de carta", response.getBody().size());
                return response.getBody();
            } else {
                log.warn("Respuesta no exitosa del servicio de carta: {}", response.getStatusCode());
                return Collections.emptyList();
            }
        } catch (Exception e) {
            log.error("Error al consultar platos en carta-service", e);
            return Collections.emptyList();
        }
    }

    public List<IngredienteSyncDto> obtenerIngredientes() {
        try {
            String url = cartaUrl + "/ingredientes";

            HttpHeaders headers = new HttpHeaders();
            headers.set(SERVICE_TOKEN_HEADER, serviceToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            log.info("Consultando ingredientes en carta-service");

            ResponseEntity<List<IngredienteSyncDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<IngredienteSyncDto>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Obtenidos {} ingredientes del servicio de carta", response.getBody().size());
                return response.getBody();
            } else {
                log.warn("Respuesta no exitosa del servicio de carta: {}", response.getStatusCode());
                return Collections.emptyList();
            }
        } catch (Exception e) {
            log.error("Error al consultar ingredientes en carta-service", e);
            return Collections.emptyList();
        }
    }

    public EscandalloSyncDto obtenerEscandallo(UUID platoId) {
        try {
            String url = cartaUrl + "/platos/" + platoId + "/escandallo";

            HttpHeaders headers = new HttpHeaders();
            headers.set(SERVICE_TOKEN_HEADER, serviceToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            log.info("Consultando escandallo para plato {} en carta-service", platoId);

            ResponseEntity<EscandalloSyncDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    EscandalloSyncDto.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Obtenido escandallo para plato {} con {} ingredientes", 
                    platoId, 
                    response.getBody().getIngredientes() != null ? response.getBody().getIngredientes().size() : 0);
                return response.getBody();
            } else {
                log.warn("Respuesta no exitosa del servicio de carta para escandallo: {}", response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            log.error("Error al consultar escandallo para plato {} en carta-service", platoId, e);
            return null;
        }
    }

    public List<TipoCartaSyncDto> obtenerTiposCarta() {
        try {
            String url = cartaUrl + "/tipos-carta";

            HttpHeaders headers = new HttpHeaders();
            headers.set(SERVICE_TOKEN_HEADER, serviceToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            log.info("Consultando tipos de carta en carta-service");

            ResponseEntity<List<TipoCartaSyncDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<TipoCartaSyncDto>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Obtenidos {} tipos de carta del servicio de carta", response.getBody().size());
                return response.getBody();
            } else {
                log.warn("Respuesta no exitosa del servicio de carta: {}", response.getStatusCode());
                return Collections.emptyList();
            }
        } catch (Exception e) {
            log.error("Error al consultar tipos de carta en carta-service", e);
            return Collections.emptyList();
        }
    }

    public PlatoSyncDto obtenerPlatoPorId(UUID platoId) {
        try {
            String url = cartaUrl + "/platos/" + platoId;

            HttpHeaders headers = new HttpHeaders();
            headers.set(SERVICE_TOKEN_HEADER, serviceToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            log.info("Consultando plato {} en carta-service", platoId);

            ResponseEntity<PlatoSyncDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    PlatoSyncDto.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Obtenido plato {} del servicio de carta", platoId);
                return response.getBody();
            } else {
                log.warn("Respuesta no exitosa del servicio de carta: {}", response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            log.error("Error al consultar plato {} en carta-service", platoId, e);
            return null;
        }
    }
}
