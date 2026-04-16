package tn.esprit.formation.Service;

import tn.esprit.formation.Security.UserDetailsImpl;

/**
 * Interface de service pour les détails utilisateur (UserDetails)
 */
public interface IUserDetailsService {

    /**
     * Charger un utilisateur par son nom d'utilisateur (email)
     *
     * @param email Email de l'utilisateur
     * @return UserDetailsImpl
     * @throws RuntimeException si l'utilisateur n'existe pas
     */
    UserDetailsImpl loadUserByUsername(String email);

    /**
     * Charger un utilisateur par son ID
     *
     * @param userId ID de l'utilisateur
     * @return UserDetailsImpl
     * @throws RuntimeException si l'utilisateur n'existe pas
     */
    UserDetailsImpl loadUserById(Long userId);
}
