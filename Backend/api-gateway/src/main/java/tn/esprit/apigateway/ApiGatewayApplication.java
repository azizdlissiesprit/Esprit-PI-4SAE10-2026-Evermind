package tn.esprit.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()

                // USER-SERVICE
                .route("user-service-api",
                        r -> r.path("/user", "/user/**")
                                .uri("lb://User"))

                .route("user-service-auth",
                        r -> r.path("/auth/**")
                                .uri("lb://User"))

                .route("user-service-users",
                        r -> r.path("/users/**")
                                .uri("lb://User"))

                // PRODUCT-SERVICE
                .route("product-service",
                        r -> r.path("/product/**")
                                .uri("lb://Product"))

                // PROFILE-SERVICE
                .route("profile-service",
                        r -> r.path("/profile/**")
                                .uri("lb://Profile"))

                // RECLAMATION-SERVICE
                .route("reclamation-service",
                        r -> r.path("/reclamation/**")
                                .filters(f -> f.stripPrefix(1))
                                .uri("lb://Reclamation"))

                // CONVERSATION-SERVICE
                .route("conversation-service",
                        r -> r.path("/conversation/**")
                                .uri("lb://Conversation"))

                // ALERT-SERVICE
                .route("alert-service",
                        r -> r.path("/alert/**")
                                .uri("lb://Alert"))

                .build();
    }


}
