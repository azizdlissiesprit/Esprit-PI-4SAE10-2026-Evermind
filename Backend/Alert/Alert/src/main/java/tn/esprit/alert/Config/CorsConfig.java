package tn.esprit.alert.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Apply to all endpoints
                .allowedOrigins("http://localhost:4200") // Allow Angular
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS") // Important: Include PATCH
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}