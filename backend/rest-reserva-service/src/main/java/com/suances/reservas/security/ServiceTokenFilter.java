package com.suances.reservas.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class ServiceTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(ServiceTokenFilter.class);
    private static final String SERVICE_TOKEN_HEADER = "X-Service-Token";

    @Value("${app.service.token:}")
    private String expectedServiceToken;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String requestUri = request.getRequestURI();
        
        // Solo aplicar a endpoints de servicio internos
        boolean isServiceEndpoint = requestUri.startsWith("/api/reservas/mesas/estado-diario") ||
                                    requestUri.startsWith("/api/reservas/franjas") ||
                                    requestUri.startsWith("/api/reservas/salas") ||
                                    requestUri.equals("/api/reservas/reservas/comanda");
        
        if (!isServiceEndpoint) {
            filterChain.doFilter(request, response);
            return;
        }

        String serviceToken = request.getHeader(SERVICE_TOKEN_HEADER);

        if (serviceToken == null || serviceToken.isEmpty()) {
            // Si no hay token de servicio, dejar que el filtro JWT lo maneje
            filterChain.doFilter(request, response);
            return;
        }

        if (!serviceToken.equals(expectedServiceToken)) {
            logger.warn("Token de servicio inválido recibido");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid service token");
            return;
        }

        // Autenticar como servicio
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        "service",
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_SERVICE"))
                );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        logger.debug("Autenticación de servicio exitosa para: {}", requestUri);
        
        filterChain.doFilter(request, response);
    }
}
