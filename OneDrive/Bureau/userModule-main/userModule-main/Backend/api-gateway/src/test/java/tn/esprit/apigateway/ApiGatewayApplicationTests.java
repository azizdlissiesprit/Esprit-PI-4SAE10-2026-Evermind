package tn.esprit.apigateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
class ApiGatewayApplicationTests {

    @Autowired
    private RouteLocator routeLocator;

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void gatewayShouldRegisterAllConfiguredRoutes() {
        List<Route> routes = routeLocator.getRoutes().collectList().block(Duration.ofSeconds(5));
        assertNotNull(routes, "The gateway routes list should be loaded");

        Set<String> routeIds = routes.stream().map(Route::getId).collect(Collectors.toSet());

        assertTrue(routeIds.contains("user-service-api"));
        assertTrue(routeIds.contains("user-service-auth"));
        assertTrue(routeIds.contains("user-service-users"));
        assertTrue(routeIds.contains("reclamation-service"));
        assertTrue(routeIds.contains("face-service"));
    }

    @Test
    void securityShouldNotBlockAnonymousRequests() {
        webTestClient.get()
                .uri("/unknown-route-for-test")
                .exchange()
                .expectStatus()
                .value(status -> {
                    assertFalse(status == HttpStatus.UNAUTHORIZED.value());
                    assertFalse(status == HttpStatus.FORBIDDEN.value());
                });
    }
}
