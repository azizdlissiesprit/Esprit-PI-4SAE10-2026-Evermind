package com.alzheimer.stock.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EverMind - Service Stock API")
                        .version("1.0.0")
                        .description("API REST pour la gestion de stock du projet EverMind. "
                                + "Ce microservice gère les catégories, les produits, les commandes, le panier et le tableau de bord.")
                        .contact(new Contact()
                                .name("Équipe EverMind")
                                .email("contact@evermind.tn")))
                .servers(List.of(
                        new Server().url("http://localhost:8095").description("Service Stock (direct)"),
                        new Server().url("http://localhost:8090").description("Via API Gateway")
                ));
    }
}
