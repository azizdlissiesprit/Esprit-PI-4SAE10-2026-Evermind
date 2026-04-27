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
				.route("auth-service", r -> r
						.path("/auth/**")
						.uri("lb://USER"))
				.route("user-service", r -> r
						.path("/user/**")
						.uri("lb://USER"))
				.route("profile-service", r -> r
						.path("/profile/**")
						.uri("lb://PROFILE"))
				.route("agenda-service", r -> r
						.path("/agenda/**")
						.uri("lb://AGENDA-MEDICAL"))
				.route("cognitive-service", r -> r
						.path("/cognitive/**")
						.uri("lb://COGNITIVE-ASSESSMENT"))
				.route("autonomy-service", r -> r
						.path("/autonomy/**")
						.uri("lb://AUTONOMY"))
				.route("simulation-service", r -> r
						.path("/simulation/**")
						.uri("lb://SENSORSIMULATOR"))
				.route("patient-service", r -> r
						.path("/patient/**")
						.uri("lb://Patient"))
				.route("intervention-service", r -> r
						.path("/intervention/**")
						.uri("lb://Intervention"))
				.route("stock-service", r -> r
						.path("/stock/**")
						.filters(f -> f.stripPrefix(1))  // strips /stock → forwards /api/categories
						.uri("lb://SERVICE-STOCK"))
				.route("product-service", r -> r
						.path("/product/**")
						.uri("lb://Product"))
				.route("conversation-service", r -> r
						.path("/conversation/**")
						.uri("lb://Conversation"))
				.route("chatbot-service", r -> r
						.path("/chatbot/**")
						.uri("lb://CHATBOT"))
				.route("stock-analytics", r -> r
						.path("/api/analytics/**")
						.uri("lb://STOCK-ANALYTICS"))
				.route("reclamation-service", r -> r
						.path("/reclamation/**")
						.uri("lb://RECLAMATION"))
				.route("face-service", r -> r
						.path("/face/**")
						.uri("http://face-service:8000"))
				.build();
	}
}
