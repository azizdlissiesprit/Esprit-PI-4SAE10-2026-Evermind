package tn.esprit.formation.Repository;

import tn.esprit.formation.Entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour les préférences de notifications
 */
@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    /**
     * Récupère les préférences d'un utilisateur
     */
    Optional<NotificationPreference> findByUserId(Long userId);
}
