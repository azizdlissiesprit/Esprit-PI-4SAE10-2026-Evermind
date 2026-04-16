package tn.esprit.formation.Service;

import tn.esprit.formation.DTO.LoginDTO;
import tn.esprit.formation.DTO.SignUpDTO;
import tn.esprit.formation.DTO.JwtResponse;
import tn.esprit.formation.Entity.User;

/**
 * Interface de service pour l'authentification
 * Définit les contrats pour l'enregistrement, la connexion et la gestion des utilisateurs
 */
public interface IAuthService {

    /**
     * Enregistrer un nouvel utilisateur
     *
     * @param signUpDTO Données d'inscription
     * @return Message de confirmation
     * @throws RuntimeException si l'email existe déjà
     */
    String registerUser(SignUpDTO signUpDTO);

    /**
     * Authentifier un utilisateur et générer les tokens JWT
     *
     * @param loginDTO Identifiants de connexion
     * @return JwtResponse contenant les tokens et infos utilisateur
     * @throws RuntimeException si les identifiants sont invalides
     */
    JwtResponse authenticateUser(LoginDTO loginDTO);

    /**
     * Récupérer l'utilisateur courant par email
     *
     * @param email Email de l'utilisateur
     * @return User
     * @throws RuntimeException si l'utilisateur n'existe pas
     */
    User getCurrentUser(String email);

    /**
     * Récupérer un utilisateur par ID
     *
     * @param userId ID de l'utilisateur
     * @return User
     * @throws RuntimeException si l'utilisateur n'existe pas
     */
    User getUserById(Long userId);

    /**
     * Désactiver un utilisateur
     *
     * @param userId ID de l'utilisateur à désactiver
     * @return Message de confirmation
     * @throws RuntimeException si l'utilisateur n'existe pas
     */
    String deactivateUser(Long userId);

    /**
     * Activer un utilisateur
     *
     * @param userId ID de l'utilisateur à activer
     * @return Message de confirmation
     * @throws RuntimeException si l'utilisateur n'existe pas
     */
    String activateUser(Long userId);

    /**
     * Vérifier si un email existe déjà
     *
     * @param email Email à vérifier
     * @return true si l'email existe, false sinon
     */
    boolean emailExists(String email);
}
