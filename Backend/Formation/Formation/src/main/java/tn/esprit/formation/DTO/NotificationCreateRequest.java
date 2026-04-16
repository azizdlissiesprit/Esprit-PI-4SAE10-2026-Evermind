package tn.esprit.formation.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la création d'une notification
 * Accepte les paramètres JSON du body
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationCreateRequest {

    /**
     * ID de l'utilisateur destinataire
     */
    private Long userId;

    /**
     * Type de notification (ENCOURAGEMENT, REMINDER, etc.)
     */
    private String type;

    /**
     * Catégorie de la notification
     */
    private String category;

    /**
     * Titre de la notification
     */
    private String title;

    /**
     * Contenu du message
     */
    private String message;

    /**
     * Priorité (LOW, MEDIUM, HIGH, CRITICAL)
     */
    private String priority;

    /**
     * ID de la formation associée (optionnel)
     */
    private Long formationId;

    /**
     * ID du module associé (optionnel)
     */
    private Long moduleId;

    /**
     * ID du quiz associé (optionnel)
     */
    private Long quizId;

    /**
     * Lien d'action (optionnel)
     */
    private String actionLink;

    /**
     * ID du template (optionnel)
     */
    private String templateId;
}
