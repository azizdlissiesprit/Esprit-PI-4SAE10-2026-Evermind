package tn.esprit.chatbot.Config;

import org.springframework.context.annotation.Configuration;

/**
 * CORS is handled by the Spring Cloud Gateway.
 * This class is intentionally empty to avoid duplicate
 * Access-Control-Allow-Origin headers.
 */
@Configuration
public class CorsConfig {
    // No CORS mappings needed — Gateway handles all CORS
}
