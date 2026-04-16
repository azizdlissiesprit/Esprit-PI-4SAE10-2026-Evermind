package tn.esprit.formation.Service;

import tn.esprit.formation.DTO.PrerequisiteFormationDTO;
import tn.esprit.formation.DTO.PrerequisiteValidationDTO;
import tn.esprit.formation.Entity.PrerequisiteFormation;
import tn.esprit.formation.Entity.ProgrammeFormation;
import tn.esprit.formation.Entity.UserTimeTrack;
import tn.esprit.formation.Repository.PrerequisiteFormationRepository;
import tn.esprit.formation.Repository.ProgrammeFormationRepository;
import tn.esprit.formation.Repository.UserTimeTrackRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service pour gérer les prérequis des formations
 */
@Service
@AllArgsConstructor
@Transactional
public class PrerequisiteFormationServiceImpl implements IPrerequisiteFormationService {

    private final PrerequisiteFormationRepository prerequisiteRepository;
    private final ProgrammeFormationRepository programmeRepository;
    private final UserTimeTrackRepository userTimeTrackRepository;

    /**
     * Ajoute un prérequis entre deux formations
     */
    @Override
    public PrerequisiteFormationDTO addPrerequisite(Long requiredFormationId, Long dependentFormationId,
                                                   PrerequisiteFormation.PrerequisiteType type,
                                                   Integer minimumValue, String description) {
        
        // Vérifier que les formations existent
        ProgrammeFormation requiredFormation = programmeRepository.findById(requiredFormationId)
            .orElseThrow(() -> new RuntimeException("Formation requise non trouvée: " + requiredFormationId));
        
        ProgrammeFormation dependentFormation = programmeRepository.findById(dependentFormationId)
            .orElseThrow(() -> new RuntimeException("Formation dépendante non trouvée: " + dependentFormationId));

        // Vérifier qu'on ne crée pas une boucle circulaire
        if (hasCyclicDependency(requiredFormationId)) {
            throw new RuntimeException("Dépendance circulaire détectée!");
        }

        // Vérifier l'unicité
        Optional<PrerequisiteFormation> existing = prerequisiteRepository
            .findByRequiredFormationIdAndDependentFormationId(requiredFormationId, dependentFormationId);
        
        if (existing.isPresent()) {
            throw new RuntimeException("Ce prérequis existe déjà");
        }

        PrerequisiteFormation prerequisite = PrerequisiteFormation.builder()
            .requiredFormation(requiredFormation)
            .dependentFormation(dependentFormation)
            .prerequisiteType(type)
            .minimumValue(minimumValue)
            .description(description)
            .active(true)
            .build();

        PrerequisiteFormation saved = prerequisiteRepository.save(prerequisite);
        return mapToDTO(saved);
    }

    /**
     * Supprime un prérequis
     */
    @Override
    public void removePrerequisite(Long prerequisiteId) {
        PrerequisiteFormation prerequisite = prerequisiteRepository.findById(prerequisiteId)
            .orElseThrow(() -> new RuntimeException("Prérequis non trouvé: " + prerequisiteId));
        prerequisiteRepository.delete(prerequisite);
    }

    /**
     * Récupère tous les prérequis d'une formation
     */
    @Override
    public List<PrerequisiteFormationDTO> getFormationPrerequisites(Long formationId) {
        return prerequisiteRepository.findActivePrerequisitesForFormation(formationId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Récupère toutes les formations qui dépendent d'une formation donnée
     */
    @Override
    public List<PrerequisiteFormationDTO> getFormationsDependingOn(Long formationId) {
        return prerequisiteRepository.findFormationsThatRequireThis(formationId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Valide si un utilisateur peut accéder à une formation
     */
    @Override
    public PrerequisiteValidationDTO validateAccess(Long userId, Long formationId) {
        ProgrammeFormation formation = programmeRepository.findById(formationId)
            .orElseThrow(() -> new RuntimeException("Formation non trouvée: " + formationId));

        List<PrerequisiteFormation> prerequisites = prerequisiteRepository
            .findActivePrerequisitesForFormation(formationId);

        if (prerequisites.isEmpty()) {
            return PrerequisiteValidationDTO.builder()
                .formationId(formationId)
                .userId(userId)
                .canAccess(true)
                .satisfiedPercentage(100)
                .message("Aucun prérequis - Accès autorisé")
                .build();
        }

        List<PrerequisiteValidationDTO.UnsatisfiedPrerequisiteDTO> unsatisfied = new ArrayList<>();
        int totalRequired = prerequisites.size();
        int satisfied = 0;

        for (PrerequisiteFormation premise : prerequisites) {
            if (isPrerequisiteSatisfied(userId, premise)) {
                satisfied++;
            } else {
                unsatisfied.add(createUnsatisfiedDTO(userId, premise));
            }
        }

        int satisfiedPercentage = (satisfied * 100) / totalRequired;
        boolean canAccess = unsatisfied.isEmpty();

        return PrerequisiteValidationDTO.builder()
            .formationId(formationId)
            .userId(userId)
            .canAccess(canAccess)
            .satisfiedPercentage(satisfiedPercentage)
            .unsatisfiedPrerequisites(unsatisfied)
            .message(canAccess ? "Tous les prérequis sont satisfaits" : 
                     satisfiedPercentage + "% des prérequis sont satisfaits")
            .build();
    }

    /**
     * Valide les prérequis sans les détails complets
     */
    @Override
    public Boolean canUserAccessFormation(Long userId, Long formationId) {
        return validateAccess(userId, formationId).getCanAccess();
    }

    /**
     * Met à jour un prérequis
     */
    @Override
    public PrerequisiteFormationDTO updatePrerequisite(Long prerequisiteId,
                                                      PrerequisiteFormation.PrerequisiteType type,
                                                      Integer minimumValue, String description) {
        PrerequisiteFormation prerequisite = prerequisiteRepository.findById(prerequisiteId)
            .orElseThrow(() -> new RuntimeException("Prérequis non trouvé: " + prerequisiteId));

        prerequisite.setPrerequisiteType(type);
        prerequisite.setMinimumValue(minimumValue);
        prerequisite.setDescription(description);

        PrerequisiteFormation updated = prerequisiteRepository.save(prerequisite);
        return mapToDTO(updated);
    }

    /**
     * Active/Désactive un prérequis
     */
    @Override
    public void togglePrerequisiteStatus(Long prerequisiteId, Boolean active) {
        PrerequisiteFormation prerequisite = prerequisiteRepository.findById(prerequisiteId)
            .orElseThrow(() -> new RuntimeException("Prérequis non trouvé: " + prerequisiteId));
        prerequisite.setActive(active);
        prerequisiteRepository.save(prerequisite);
    }

    /**
     * Récupère les formations accessibles pour un utilisateur
     */
    @Override
    public List<PrerequisiteFormationDTO> getAccessibleFormations(Long userId) {
        List<ProgrammeFormation> allFormations = programmeRepository.findAll();
        
        return allFormations.stream()
            .filter(formation -> canUserAccessFormation(userId, formation.getId()))
            .map(formation -> PrerequisiteFormationDTO.builder()
                .dependentFormationId(formation.getId())
                .dependentFormationTitle(formation.getTitre())
                .build())
            .collect(Collectors.toList());
    }

    /**
     * Détecte les dépendances circulaires
     */
    @Override
    public Boolean hasCyclicDependency(Long formationId) {
        return detectCycle(formationId, new HashSet<>());
    }

    // ============ Méthodes utilitaires privées ============

    /**
     * Vérifie si un prérequis est satisfait par un utilisateur
     */
    private boolean isPrerequisiteSatisfied(Long userId, PrerequisiteFormation prerequisite) {
        ProgrammeFormation requiredFormation = prerequisite.getRequiredFormation();

        switch (prerequisite.getPrerequisiteType()) {
            case REQUIRED:
                // La formation doit être 100% complétée
                return isFormationComplete(userId, requiredFormation.getId());

            case MINIMUM_SCORE:
                // Vérifier un score minimum (implémentation future avec système de scoring)
                return true; // Placeholder

            case MINIMUM_TIME:
                // Vérifier le temps minimum passé
                return hasMinimumTimeSpent(userId, requiredFormation.getId(), prerequisite.getMinimumValue());

            case MODULE_COMPLETION:
                // Au minimum un module doit être complété
                return true; // Placeholder

            default:
                return false;
        }
    }

    /**
     * Vérifie si une formation est complètement complétée
     */
    private boolean isFormationComplete(Long userId, Long formationId) {
        // Pour l'instant, on considère qu'une formation est complète si l'utilisateur y a passé du temps
        Optional<UserTimeTrack> timeTrack = userTimeTrackRepository
            .findByUserIdAndCourseId(userId, formationId);
        return timeTrack.isPresent();
    }

    /**
     * Vérifie si un utilisateur a passé le temps minimum sur une formation
     */
    private boolean hasMinimumTimeSpent(Long userId, Long formationId, Integer minimumMinutes) {
        Optional<UserTimeTrack> timeTrack = userTimeTrackRepository
            .findByUserIdAndCourseId(userId, formationId);
        
        if (timeTrack.isEmpty()) {
            return false;
        }

        long totalMinutes = (timeTrack.get().getTotalTimeSpent() != null ? 
            timeTrack.get().getTotalTimeSpent() : 0) / 60;
        return totalMinutes >= minimumMinutes;
    }

    /**
     * Crée un DTO pour un prérequis non satisfait
     */
    private PrerequisiteValidationDTO.UnsatisfiedPrerequisiteDTO createUnsatisfiedDTO(
        Long userId, PrerequisiteFormation prerequisite) {
        
        int currentValue = 0;
        Optional<UserTimeTrack> timeTrack = userTimeTrackRepository
            .findByUserIdAndCourseId(userId, prerequisite.getRequiredFormation().getId());
        
        if (timeTrack.isPresent() && prerequisite.getPrerequisiteType() == PrerequisiteFormation.PrerequisiteType.MINIMUM_TIME) {
            currentValue = (int) ((timeTrack.get().getTotalTimeSpent() != null ? 
                timeTrack.get().getTotalTimeSpent() : 0) / 60);
        }

        return PrerequisiteValidationDTO.UnsatisfiedPrerequisiteDTO.builder()
            .requiredFormationId(prerequisite.getRequiredFormation().getId())
            .requiredFormationTitle(prerequisite.getRequiredFormation().getTitre())
            .prerequisiteType(prerequisite.getPrerequisiteType().toString())
            .minimumRequired(prerequisite.getMinimumValue())
            .currentValue(currentValue)
            .message("Prérequis non satisfait: " + prerequisite.getDescription())
            .build();
    }

    /**
     * Détecte les cycles dans les dépendances
     */
    private boolean detectCycle(Long formationId, Set<Long> visited) {
        if (visited.contains(formationId)) {
            return true;
        }

        visited.add(formationId);

        List<PrerequisiteFormation> dependents = prerequisiteRepository
            .findFormationsThatRequireThis(formationId);

        for (PrerequisiteFormation dep : dependents) {
            if (detectCycle(dep.getDependentFormation().getId(), new HashSet<>(visited))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Mappe une entité PrerequisiteFormation vers son DTO
     */
    private PrerequisiteFormationDTO mapToDTO(PrerequisiteFormation entity) {
        return PrerequisiteFormationDTO.builder()
            .id(entity.getId())
            .requiredFormationId(entity.getRequiredFormation().getId())
            .requiredFormationTitle(entity.getRequiredFormation().getTitre())
            .dependentFormationId(entity.getDependentFormation().getId())
            .dependentFormationTitle(entity.getDependentFormation().getTitre())
            .prerequisiteType(entity.getPrerequisiteType().toString())
            .minimumValue(entity.getMinimumValue())
            .description(entity.getDescription())
            .active(entity.getActive())
            .build();
    }
}
