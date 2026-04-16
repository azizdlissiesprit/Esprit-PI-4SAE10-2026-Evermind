package tn.esprit.formation.DTO;

import lombok.*;
import java.util.List;

/**
 * DTO pour valider si un utilisateur peut accéder à une formation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrerequisiteValidationDTO {

    /**
     * ID de la formation à vérifier
     */
    private Long formationId;

    /**
     * ID de l'utilisateur
     */
    private Long userId;

    /**
     * Indique si tous les prérequis sont satisfaits
     */
    private Boolean canAccess;

    /**
     * Pourcentage de prérequis satisfaits
     */
    private Integer satisfiedPercentage;

    /**
     * Liste des prérequis non satisfaits
     */
    @Builder.Default
    private List<UnsatisfiedPrerequisiteDTO> unsatisfiedPrerequisites = List.of();

    /**
     * Message global
     */
    private String message;

    /**
     * Imbriquée DTO pour détailler les prérequis non satisfaits
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UnsatisfiedPrerequisiteDTO {
        private Long requiredFormationId;
        private String requiredFormationTitle;
        private String prerequisiteType;
        private Integer minimumRequired;
        private Integer currentValue;
        private String message;
    }
}
