package tn.esprit.formation.Service;

import tn.esprit.formation.DTO.JwtResponse;
import tn.esprit.formation.DTO.LoginDTO;
import tn.esprit.formation.DTO.SignUpDTO;
import tn.esprit.formation.Entity.Role;
import tn.esprit.formation.Entity.User;
import tn.esprit.formation.Repository.RoleRepository;
import tn.esprit.formation.Repository.UserRepository;
import tn.esprit.formation.Security.JwtUtils;
import tn.esprit.formation.Security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Inscription d'un nouvel utilisateur
     */
    @Transactional
    public String registerUser(SignUpDTO signUpDTO) {
        log.info("Inscription d'un nouvel utilisateur: {}", signUpDTO.getEmail());

        // Vérifier si l'utilisateur existe déjà
        if (userRepository.existsByEmail(signUpDTO.getEmail())) {
            throw new RuntimeException("Email déjà utilisé!");
        }

        // Vérifier les mots de passe
        if (!signUpDTO.getMotDePasse().equals(signUpDTO.getConfirmMotDePasse())) {
            throw new RuntimeException("Les mots de passe ne correspondent pas!");
        }

        // Créer un nouvel utilisateur
        User user = new User(
                signUpDTO.getNom(),
                signUpDTO.getPrenom(),
                signUpDTO.getEmail(),
                passwordEncoder.encode(signUpDTO.getMotDePasse())
        );

        // Assigner le rôle
        Set<Role> roles = new HashSet<>();
        String roleName = signUpDTO.getRole() != null ? signUpDTO.getRole() : "AIDANT";
        
        Role userRole = roleRepository.findByName(Role.ERole.valueOf("ROLE_" + roleName.toUpperCase()))
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé!"));
        
        roles.add(userRole);
        user.setRoles(roles);

        userRepository.save(user);
        log.info("Utilisateur enregistré avec succès: {}", signUpDTO.getEmail());

        return "Utilisateur enregistré avec succès!";
    }

    /**
     * Connexion utilisateur
     */
    @Transactional
    public JwtResponse authenticateUser(LoginDTO loginDTO) {
        log.info("Authentification de l'utilisateur: {}", loginDTO.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getMotDePasse())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String jwt = jwtUtils.generateJwtToken(authentication);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails.getEmail());

        Set<String> roles = userDetails.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(Collectors.toSet());

        log.info("Utilisateur authentifié avec succès: {}", loginDTO.getEmail());

        return JwtResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken)
                .type("Bearer")
                .id(userDetails.getId())
                .email(userDetails.getEmail())
                .nom(userDetails.getNom())
                .prenom(userDetails.getPrenom())
                .roles(roles)
                .expiresIn(jwtUtils.getJwtExpirationMs())
                .build();
    }

    /**
     * Récupère l'utilisateur courant
     */
    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé!"));
    }

    /**
     * Récupère un utilisateur par son ID
     */
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé!"));
    }

    /**
     * Désactiver un utilisateur
     */
    @Transactional
    public String deactivateUser(Long userId) {
        User user = getUserById(userId);
        user.setActif(false);
        userRepository.save(user);
        log.info("Utilisateur désactivé: {}", userId);
        return "Utilisateur désactivé avec succès!";
    }

    /**
     * Activer un utilisateur
     */
    @Transactional
    public String activateUser(Long userId) {
        User user = getUserById(userId);
        user.setActif(true);
        userRepository.save(user);
        log.info("Utilisateur activé: {}", userId);
        return "Utilisateur activé avec succès!";
    }
}
