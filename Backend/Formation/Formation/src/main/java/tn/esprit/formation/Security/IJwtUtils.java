package tn.esprit.formation.Security;

/**
 * Interface pour la gestion des tokens JWT
 */
public interface IJwtUtils {

    /**
     * Générer un JWT token
     *
     * @param email Email de l'utilisateur
     * @param roles Rôles de l'utilisateur
     * @return JWT token
     */
    String generateJwtToken(String email, java.util.Collection<String> roles);

    /**
     * Générer un refresh token
     *
     * @param email Email de l'utilisateur
     * @return Refresh token
     */
    String generateRefreshToken(String email);

    /**
     * Valider un JWT token
     *
     * @param token Token à valider
     * @return true si valide, false sinon
     */
    boolean validateJwtToken(String token);

    /**
     * Extraire l'email du JWT token
     *
     * @param token Token JWT
     * @return Email
     */
    String getEmailFromJwtToken(String token);

    /**
     * Extraire les rôles du JWT token
     *
     * @param token Token JWT
     * @return Liste des rôles
     */
    java.util.Collection<String> getRolesFromJwtToken(String token);

    /**
     * Obtenir le délai d'expiration du token
     *
     * @return Délai en millisecondes
     */
    long getJwtExpirationMs();
}
