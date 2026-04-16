package tn.esprit.formation.Controller;

import tn.esprit.formation.Entity.User;
import tn.esprit.formation.Service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/admin")
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AuthService authService;

    /**
     * Dashboard admin
     * GET /admin/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        log.info("Accès au dashboard admin");
        Map<String, String> response = new HashMap<>();
        response.put("message", "Bienvenue sur le dashboard admin!");
        response.put("status", "ok");
        return ResponseEntity.ok(response);
    }

    /**
     * Désactiver un utilisateur (ADMIN seulement)
     * POST /admin/users/{id}/deactivate
     */
    @PostMapping("/users/{id}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        log.info("Désactivation de l'utilisateur: {}", id);
        String message = authService.deactivateUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    /**
     * Activer un utilisateur (ADMIN seulement)
     * POST /admin/users/{id}/activate
     */
    @PostMapping("/users/{id}/activate")
    public ResponseEntity<?> activateUser(@PathVariable Long id) {
        log.info("Activation de l'utilisateur: {}", id);
        String message = authService.activateUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtenir les informations d'un utilisateur
     * GET /admin/users/{id}
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserInfo(@PathVariable Long id) {
        log.info("Récupération des informations de l'utilisateur: {}", id);
        User user = authService.getUserById(id);
        return ResponseEntity.ok(user);
    }
}
