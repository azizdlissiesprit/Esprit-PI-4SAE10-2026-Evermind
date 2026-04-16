package tn.esprit.formation.Service;

import tn.esprit.formation.Entity.User;

/**
 * Interface de service pour la gestion des utilisateurs
 */
public interface IUserService {

    /**
     * Récupérer un utilisateur par ID
     *
     * @param userId ID de l'utilisateur
     * @return User
     */
    User getUserById(Long userId);

    /**
     * Récupérer un utilisateur par email
     *
     * @param email Email de l'utilisateur
     * @return User
     */
    User getUserByEmail(String email);

    /**
     * Vérifier si un email existe
     *
     * @param email Email à vérifier
     * @return true si existe, false sinon
     */
    boolean emailExists(String email);

    /**
     * Désactiver un utilisateur
     *
     * @param userId ID de l'utilisateur
     */
    void deactivateUser(Long userId);

    /**
     * Activer un utilisateur
     *
     * @param userId ID de l'utilisateur
     */
    void activateUser(Long userId);

    /**
     * Sauvegarder un utilisateur
     *
     * @param user Utilisateur à sauvegarder
     * @return User sauvegardé
     */
    User saveUser(User user);
}
