package tn.esprit.formation.Service;

import tn.esprit.formation.DTO.PrerequisiteFormationDTO;
import tn.esprit.formation.DTO.PrerequisiteValidationDTO;
import tn.esprit.formation.Entity.PrerequisiteFormation;

import java.util.List;

/**
 * Interface pour gérer les prérequis des formations
 */
public interface IPrerequisiteFormationService {

    /**
     * Ajoute un prérequis entre deux formations
     */
    PrerequisiteFormationDTO addPrerequisite(Long requiredFormationId, Long dependentFormationId,
                                            PrerequisiteFormation.PrerequisiteType type,
                                            Integer minimumValue, String description);

    /**
     * Supprime un prérequis
     */
    void removePrerequisite(Long prerequisiteId);

    /**
     * Récupère tous les prérequis d'une formation
     */
    List<PrerequisiteFormationDTO> getFormationPrerequisites(Long formationId);

    /**
     * Récupère toutes les formations qui dépendent d'une formation donnée
     */
    List<PrerequisiteFormationDTO> getFormationsDependingOn(Long formationId);

    /**
     * Valide si un utilisateur peut accéder à une formation
     */
    PrerequisiteValidationDTO validateAccess(Long userId, Long formationId);

    /**
     * Valide les prérequis sans les détails complets (juste un boolean)
     */
    Boolean canUserAccessFormation(Long userId, Long formationId);

    /**
     * Met à jour un prérequis
     */
    PrerequisiteFormationDTO updatePrerequisite(Long prerequisiteId, 
                                               PrerequisiteFormation.PrerequisiteType type,
                                               Integer minimumValue, String description);

    /**
     * Active/Désactive un prérequis
     */
    void togglePrerequisiteStatus(Long prerequisiteId, Boolean active);

    /**
     * Récupère les formations accessibles pour un utilisateur (filtrées par les prérequis)
     */
    List<PrerequisiteFormationDTO> getAccessibleFormations(Long userId);

    /**
     * Détecte les dépendances circulaires
     */
    Boolean hasCyclicDependency(Long formationId);
}
