package tn.esprit.formation.Repository;

import tn.esprit.formation.Entity.PrerequisiteFormation;
import tn.esprit.formation.Entity.ProgrammeFormation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour gérer les prérequis des formations
 */
@Repository
public interface PrerequisiteFormationRepository extends JpaRepository<PrerequisiteFormation, Long> {

    /**
     * Récupère tous les prérequis pour une formation donnée (ce qui doit être complété avant)
     */
    List<PrerequisiteFormation> findByDependentFormationIdAndActiveTrue(Long dependentFormationId);

    /**
     * Récupère toutes les formations qui dépendent d'une formation donnée
     */
    List<PrerequisiteFormation> findByRequiredFormationIdAndActiveTrue(Long requiredFormationId);

    /**
     * Vérifie s'il existe une relation de prérequis entre deux formations
     */
    Optional<PrerequisiteFormation> findByRequiredFormationIdAndDependentFormationId(
        Long requiredFormationId, Long dependentFormationId);

    /**
     * Récupère tous les prérequis actifs entre deux formations
     */
    @Query("SELECT p FROM PrerequisiteFormation p " +
           "WHERE p.dependentFormation.id = :formationId AND p.active = true")
    List<PrerequisiteFormation> findActivePrerequisitesForFormation(@Param("formationId") Long formationId);

    /**
     * Récupère tous les formations qui ont cette formation comme prérequis
     */
    @Query("SELECT p FROM PrerequisiteFormation p " +
           "WHERE p.requiredFormation.id = :formationId AND p.active = true")
    List<PrerequisiteFormation> findFormationsThatRequireThis(@Param("formationId") Long formationId);

    /**
     * Compte le nombre de prérequis non satisfaits
     */
    @Query("SELECT COUNT(p) FROM PrerequisiteFormation p " +
           "WHERE p.dependentFormation.id = :formationId AND p.active = true")
    long countActivePrerequisites(@Param("formationId") Long formationId);
}
