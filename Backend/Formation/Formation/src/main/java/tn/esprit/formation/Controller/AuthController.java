package tn.esprit.formation.Controller;

import tn.esprit.formation.DTO.JwtResponse;
import tn.esprit.formation.DTO.LoginDTO;
import tn.esprit.formation.DTO.SignUpDTO;
import tn.esprit.formation.Service.AuthService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/auth")
@Slf4j
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Inscription d'un nouvel utilisateur
     * POST /auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpDTO signUpDTO) {
        log.info("Requête d'inscription: {}", signUpDTO.getEmail());
        try {
            String message = authService.registerUser(signUpDTO);
            Map<String, String> response = new HashMap<>();
            response.put("message", message);
            response.put("email", signUpDTO.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Erreur lors de l'inscription: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Erreur interne lors de l'inscription", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erreur interne du serveur");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Connexion utilisateur
     * POST /auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginDTO loginDTO) {
        log.info("Requête de connexion: {}", loginDTO.getEmail());
        try {
            JwtResponse jwtResponse = authService.authenticateUser(loginDTO);
            log.info("Connexion réussie pour: {}", loginDTO.getEmail());
            return ResponseEntity.ok(jwtResponse);
        } catch (RuntimeException e) {
            log.error("Erreur lors de la connexion: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Email ou mot de passe incorrect");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (Exception e) {
            log.error("Erreur interne lors de la connexion", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erreur interne du serveur");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Vérifier l'authentification
     * GET /auth/check
     */
    @GetMapping("/check")
    public ResponseEntity<?> checkAuth() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Authentification valide");
        return ResponseEntity.ok(response);
    }

    /**
     * Obtenir les informations de l'utilisateur courant
     * GET /auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        return ResponseEntity.ok().build();
    }
}
