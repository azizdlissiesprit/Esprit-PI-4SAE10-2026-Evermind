package tn.esprit.formation.Controller;

import tn.esprit.formation.DTO.PrerequisiteFormationDTO;
import tn.esprit.formation.DTO.PrerequisiteValidationDTO;
import tn.esprit.formation.Entity.PrerequisiteFormation;
import tn.esprit.formation.Service.IPrerequisiteFormationService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur pour gérer les prérequis des formations
 */
@RestController
@RequestMapping("/formation/prerequisites")
@AllArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PrerequisiteFormationController {

    private final IPrerequisiteFormationService prerequisiteService;

    /**
     * Ajoute un prérequis entre deux formations
     * POST /formation/prerequisites/add
     * Body: {
     *   "requiredFormationId": 1,
     *   "dependentFormationId": 2,
     *   "prerequisiteType": "REQUIRED",
     *   "minimumValue": 70,
     *   "description": "Cette formation nécessite de compléter..."
     * }
     */
    @PostMapping("/add")
    public ResponseEntity<PrerequisiteFormationDTO> addPrerequisite(
            @RequestParam Long requiredFormationId,
            @RequestParam Long dependentFormationId,
            @RequestParam(defaultValue = "REQUIRED") String prerequisiteType,
            @RequestParam(required = false) Integer minimumValue,
            @RequestParam(required = false) String description) {
        try {
            PrerequisiteFormation.PrerequisiteType type = 
                PrerequisiteFormation.PrerequisiteType.valueOf(prerequisiteType);
            
            PrerequisiteFormationDTO result = prerequisiteService.addPrerequisite(
                requiredFormationId, dependentFormationId, type, minimumValue, description);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'ajout du prérequis: " + e.getMessage());
        }
    }

    /**
     * Récupère tous les prérequis d'une formation
     * GET /formation/prerequisites/{formationId}
     */
    @GetMapping("/{formationId}")
    public ResponseEntity<List<PrerequisiteFormationDTO>> getFormationPrerequisites(
            @PathVariable Long formationId) {
        List<PrerequisiteFormationDTO> prerequisites = prerequisiteService.getFormationPrerequisites(formationId);
        return ResponseEntity.ok(prerequisites);
    }

    /**
     * Récupère toutes les formations qui dépendent d'une formation
     * GET /formation/prerequisites/{formationId}/dependents
     */
    @GetMapping("/{formationId}/dependents")
    public ResponseEntity<List<PrerequisiteFormationDTO>> getFormationsDependingOn(
            @PathVariable Long formationId) {
        List<PrerequisiteFormationDTO> dependents = prerequisiteService.getFormationsDependingOn(formationId);
        return ResponseEntity.ok(dependents);
    }

    /**
     * Valide si un utilisateur peut accéder à une formation
     * GET /formation/prerequisites/validate/{userId}/{formationId}
     */
    @GetMapping("/validate/{userId}/{formationId}")
    public ResponseEntity<PrerequisiteValidationDTO> validateAccess(
            @PathVariable Long userId,
            @PathVariable Long formationId) {
        PrerequisiteValidationDTO validation = prerequisiteService.validateAccess(userId, formationId);
        return ResponseEntity.ok(validation);
    }

    /**
     * Vérifie si un utilisateur peut accéder à une formation (simple boolean)
     * GET /formation/prerequisites/can-access/{userId}/{formationId}
     */
    @GetMapping("/can-access/{userId}/{formationId}")
    public ResponseEntity<Boolean> canAccess(
            @PathVariable Long userId,
            @PathVariable Long formationId) {
        Boolean canAccess = prerequisiteService.canUserAccessFormation(userId, formationId);
        return ResponseEntity.ok(canAccess);
    }

    /**
     * Récupère toutes les formations accessibles pour un utilisateur
     * GET /formation/prerequisites/accessible/{userId}
     */
    @GetMapping("/accessible/{userId}")
    public ResponseEntity<List<PrerequisiteFormationDTO>> getAccessibleFormations(
            @PathVariable Long userId) {
        List<PrerequisiteFormationDTO> formations = prerequisiteService.getAccessibleFormations(userId);
        return ResponseEntity.ok(formations);
    }

    /**
     * Met à jour un prérequis
     * PUT /formation/prerequisites/{prerequisiteId}
     */
    @PutMapping("/{prerequisiteId}")
    public ResponseEntity<PrerequisiteFormationDTO> updatePrerequisite(
            @PathVariable Long prerequisiteId,
            @RequestParam(defaultValue = "REQUIRED") String prerequisiteType,
            @RequestParam(required = false) Integer minimumValue,
            @RequestParam(required = false) String description) {
        try {
            PrerequisiteFormation.PrerequisiteType type = 
                PrerequisiteFormation.PrerequisiteType.valueOf(prerequisiteType);
            
            PrerequisiteFormationDTO updated = prerequisiteService.updatePrerequisite(
                prerequisiteId, type, minimumValue, description);
            
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la mise à jour: " + e.getMessage());
        }
    }

    /**
     * Active ou désactive un prérequis
     * PATCH /formation/prerequisites/{prerequisiteId}/status
     */
    @PatchMapping("/{prerequisiteId}/status")
    public ResponseEntity<String> toggleStatus(
            @PathVariable Long prerequisiteId,
            @RequestParam Boolean active) {
        prerequisiteService.togglePrerequisiteStatus(prerequisiteId, active);
        String status = active ? "activé" : "désactivé";
        return ResponseEntity.ok("Prérequis " + status + " avec succès");
    }

    /**
     * Supprime un prérequis
     * DELETE /formation/prerequisites/{prerequisiteId}
     */
    @DeleteMapping("/{prerequisiteId}")
    public ResponseEntity<String> deletePrerequisite(@PathVariable Long prerequisiteId) {
        try {
            prerequisiteService.removePrerequisite(prerequisiteId);
            return ResponseEntity.ok("Prérequis supprimé avec succès");
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la suppression: " + e.getMessage());
        }
    }

    /**
     * Vérifie s'il existe une dépendance circulaire
     * GET /formation/prerequisites/check-cycle/{formationId}
     */
    @GetMapping("/check-cycle/{formationId}")
    public ResponseEntity<Boolean> checkForCycle(@PathVariable Long formationId) {
        Boolean hasCycle = prerequisiteService.hasCyclicDependency(formationId);
        return ResponseEntity.ok(hasCycle);
    }
}
