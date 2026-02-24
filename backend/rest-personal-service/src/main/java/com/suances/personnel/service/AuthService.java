package com.suances.personnel.service;

import com.suances.personnel.domain.model.AuditoriaAcceso;
import com.suances.personnel.domain.model.Usuario;
import com.suances.personnel.dto.request.LoginRequest;
import com.suances.personnel.dto.response.LoginResponse;
import com.suances.personnel.dto.response.UserInfoResponse;
import com.suances.personnel.repository.AuditoriaAccesoRepository;
import com.suances.personnel.repository.UsuarioRepository;
import com.suances.personnel.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

        private static final Logger log = LoggerFactory.getLogger(AuthService.class);

        private final UsuarioRepository usuarioRepository;
        private final AuditoriaAccesoRepository auditoriaRepository;
        private final JwtTokenProvider tokenProvider;
        private final PasswordEncoder passwordEncoder;
        private final SecurityEventProducer eventProducer;

        public AuthService(UsuarioRepository usuarioRepository,
                        AuditoriaAccesoRepository auditoriaRepository,
                        JwtTokenProvider tokenProvider,
                        PasswordEncoder passwordEncoder,
                        SecurityEventProducer eventProducer) {
                this.usuarioRepository = usuarioRepository;
                this.auditoriaRepository = auditoriaRepository;
                this.tokenProvider = tokenProvider;
                this.passwordEncoder = passwordEncoder;
                this.eventProducer = eventProducer;
        }

        public LoginResponse login(LoginRequest request, String ipAddress, String userAgent) {
                Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                                .orElse(null);

                // Validar credenciales
                if (usuario == null || !usuario.getActivo() ||
                                !passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {

                        // Registrar intento fallido
                        registrarAuditoria(
                                        usuario != null ? usuario.getId() : null,
                                        request.getUsername(),
                                        ipAddress,
                                        userAgent,
                                        "FAILED");

                        eventProducer.publishLoginEvent(
                                        "auth.login.failed",
                                        null,
                                        request.getUsername(),
                                        null,
                                        ipAddress);

                        log.warn("Login fallido para username: {}", request.getUsername());
                        throw new RuntimeException("Credenciales incorrectas");
                }

                // Generar token
                String token = tokenProvider.generateToken(usuario.getId(), usuario.getFullName(), usuario.getRole());

                // Registrar acceso exitoso
                registrarAuditoria(
                                usuario.getId(),
                                usuario.getUsername(),
                                ipAddress,
                                userAgent,
                                "SUCCESS");

                eventProducer.publishLoginEvent(
                                "auth.login.success",
                                usuario.getId(),
                                usuario.getUsername(),
                                usuario.getRole().name(),
                                ipAddress);

                log.info("Login exitoso para usuario: {}", usuario.getUsername());

                UserInfoResponse userInfo = new UserInfoResponse(
                                usuario.getId(),
                                usuario.getFullName(),
                                usuario.getRole(),
                                usuario.getImageUrl());

                return new LoginResponse(token, tokenProvider.getExpirationSeconds(), userInfo);
        }

        private void registrarAuditoria(java.util.UUID usuarioId, String username,
                        String ip, String userAgent, String status) {
                AuditoriaAcceso auditoria = new AuditoriaAcceso();
                auditoria.setUsuarioId(usuarioId);
                auditoria.setUsernameAttempt(username);
                auditoria.setIpAddress(ip);
                auditoria.setUserAgent(userAgent);
                auditoria.setStatus(status);
                auditoriaRepository.save(auditoria);
        }
}
