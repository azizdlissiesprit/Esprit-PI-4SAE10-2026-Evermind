package tn.esprit.gateway;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class SwaggerConfigController {

    @GetMapping("/v3/api-docs/swagger-config")
    public Map<String, Object> swaggerConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("configUrl", "/v3/api-docs/swagger-config");
        config.put("oauth2RedirectUrl", "/webjars/swagger-ui/oauth2-redirect.html");
        config.put("urls", List.of(
            Map.of("name", "Alert Service", "url", "/alert/v3/api-docs"),
            Map.of("name", "Agenda Medical Service", "url", "/agenda/v3/api-docs"),
            Map.of("name", "Autonomy Service", "url", "/autonomy/v3/api-docs"),
            Map.of("name", "Cognitive Assessment Service", "url", "/cognitive/v3/api-docs"),
            Map.of("name", "Conversation Service", "url", "/conversation/v3/api-docs"),
            Map.of("name", "Intervention Service", "url", "/intervention/v3/api-docs"),
            Map.of("name", "Patient Service", "url", "/patient/v3/api-docs"),
            Map.of("name", "Product Service", "url", "/product/v3/api-docs"),
            Map.of("name", "Profile Service", "url", "/profile/v3/api-docs"),
            Map.of("name", "Sensor Simulator", "url", "/simulation/v3/api-docs"),
            Map.of("name", "Stock Service", "url", "/api/v3/api-docs"),
            Map.of("name", "User Service", "url", "/user/v3/api-docs")
        ));
        config.put("validatorUrl", "");
        return config;
    }
}
