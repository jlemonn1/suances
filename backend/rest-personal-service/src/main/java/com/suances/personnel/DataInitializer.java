package com.suances.personnel;

import com.suances.personnel.domain.enums.Rol;
import com.suances.personnel.domain.model.Usuario;
import com.suances.personnel.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initAdminUser(UsuarioRepository usuarioRepository,
                                           PasswordEncoder passwordEncoder,
                                           com.suances.personnel.config.AdminConfig adminConfig) {
        return args -> {
            if (!adminConfig.isCreateOnStartup()) {
                log.info("Creación de usuario admin deshabilitada por configuración");
                return;
            }

            if (usuarioRepository.count() > 0) {
                log.info("Ya existen usuarios en la base de datos, omitiendo creación de admin");
                return;
            }

            Usuario admin = Usuario.builder()
                    .username(adminConfig.getUsername())
                    .password(passwordEncoder.encode(adminConfig.getPassword()))
                    .fullName("Admin Inicial")
                    .role(Rol.PROPIETARIO)
                    .activo(true)
                    .build();

            usuarioRepository.save(admin);
            log.info("Usuario admin creado: {} con rol PROPIETARIO", admin.getUsername());
        };
    }
}
