package tn.esprit.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayApplication.class, args);
	}

	// Define routes in Java instead of YAML (bypasses the config binding issue)
	@Bean
	public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
		return builder.routes()
				.route("alert-service", r -> r
						.path("/alert/**")
						.uri("lb://Alert"))
				.route("user-service", r -> r
						.path("/user/**")
						.uri("lb://USER"))
				.route("profile-service", r -> r
						.path("/profile/**")
						.uri("lb://PROFILE"))
				.route("cognitive-service", r -> r
						.path("/cognitive/**")
						.uri("lb://COGNITIVE-ASSESSMENT"))
				.route("autonomy-service", r -> r
						.path("/autonomy/**")
						.uri("lb://AUTONOMY"))
				.build();
	}
}