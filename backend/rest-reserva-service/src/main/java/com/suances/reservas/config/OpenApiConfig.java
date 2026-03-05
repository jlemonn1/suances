package com.suances.reservas.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI reservasOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Suances Reservas API")
                        .description("Gestión de salas, mesas, franjas, reservas y bloqueos")
                        .version("v1")
                        .contact(new Contact()
                                .name("Equipo Suances")
                                .email("tech@suances.com"))
                        .license(new License().name("Proprietary")))
                .externalDocs(new ExternalDocumentation()
                        .description("Documentación funcional")
                        .url("https://suances.local/docs/reservas"));
    }
}
