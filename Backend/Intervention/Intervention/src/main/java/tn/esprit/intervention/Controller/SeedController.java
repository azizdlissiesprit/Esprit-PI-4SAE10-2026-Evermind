package tn.esprit.intervention.Controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.intervention.Service.SeedService;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/intervention/seed")
@Slf4j
public class SeedController {

    private final SeedService seedService;

    public SeedController(@Qualifier("seedService") SeedService seedService) {
        this.seedService = seedService;
    }

    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> executeSeed() {
        try {
            return ResponseEntity.ok(seedService.executeSeed());
        } catch (Exception e) {
            log.error("❌ Intervention seed execution failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildErrorResponse("SEED_FAILED", "Intervention seeding failed", e));
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, Object>> clearSeed() {
        try {
            return ResponseEntity.ok(seedService.clearSeed());
        } catch (Exception e) {
            log.error("❌ Intervention seed clear failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildErrorResponse("CLEAR_FAILED", "Intervention seed clearing failed", e));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        try {
            return ResponseEntity.ok(seedService.getStatus());
        } catch (Exception e) {
            log.error("❌ Intervention seed status check failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildErrorResponse("STATUS_FAILED", "Could not retrieve seed status", e));
        }
    }

    private Map<String, Object> buildErrorResponse(String status, String message, Exception e) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("status", status);
        error.put("message", message);
        error.put("error", e.getClass().getSimpleName() + ": " + e.getMessage());
        error.put("timestamp", LocalDateTime.now().toString());
        if (e.getCause() != null && e.getCause() != e) {
            error.put("rootCause", e.getCause().getClass().getSimpleName() + ": " + e.getCause().getMessage());
        }
        return error;
    }
}
