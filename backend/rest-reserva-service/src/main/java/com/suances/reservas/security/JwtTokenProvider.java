package com.suances.reservas.security;

import com.suances.reservas.domain.model.enums.Rol;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey key;
    private final String issuer;
    private final String audience;
    private final Set<String> allowedRoles;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.issuer}") String issuer,
            @Value("${app.jwt.audience}") String audience,
            @Value("${app.jwt.allowed-roles}") String allowedRoles) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
        this.audience = audience;
        this.allowedRoles = new HashSet<>(Arrays.asList(allowedRoles.split(",")));
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = parse(token);
            logger.info("Token claims - issuer: {}, audience: {}, rol: {}", claims.getIssuer(), claims.getAudience(), claims.get("rol"));
            boolean issuerMatches = issuer.equals(claims.getIssuer());
            Collection<String> audiences = claims.getAudience();
            boolean audienceMatches = audiences != null && audiences.contains(audience);
            String rol = claims.get("rol", String.class);
            boolean roleMatches = allowedRoles.contains(rol);
            logger.info("Validation - issuer: {}, audience: {}, role: {}", issuerMatches, audienceMatches, roleMatches);
            return issuerMatches && audienceMatches && roleMatches;
        } catch (SecurityException | MalformedJwtException | UnsupportedJwtException | IllegalArgumentException ex) {
            logger.error("Invalid JWT token", ex);
        } catch (ExpiredJwtException ex) {
            logger.warn("Expired JWT token");
        }
        return false;
    }

    public UUID getUserId(String token) {
        return UUID.fromString(parse(token).getSubject());
    }

    public Rol getRol(String token) {
        return Rol.valueOf(parse(token).get("rol", String.class));
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
