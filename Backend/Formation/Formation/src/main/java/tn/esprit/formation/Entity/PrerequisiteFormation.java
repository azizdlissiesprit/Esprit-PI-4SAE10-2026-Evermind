package tn.esprit.formation.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entité pour gérer les dépendances entre formations et modules
 * Permet de définir qu'une formation A doit être complétée avant d'accéder à la formation B
 */
@Entity
@Table(name = "prerequisite_formations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"required_formation_id", "dependent_formation_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrerequisiteFormation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Formation qui DOIT être complétée en premier (prérequis)
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "required_formation_id", nullable = false)
    private ProgrammeFormation requiredFormation;

    /**
     * Formation qui DÉPEND du prérequis
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dependent_formation_id", nullable = false)
    private ProgrammeFormation dependentFormation;

    /**
     * Type de prérequis
     * REQUIRED: Doit être complétée à 100%
     * MINIMUM_SCORE: Doit atteindre une note minimale
     * MINIMUM_TIME: Doit avoir passé un temps minimum
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PrerequisiteType prerequisiteType = PrerequisiteType.REQUIRED;

    /**
     * Valeur minimale requise (ex: 70 pour la note, 120 pour le temps en minutes)
     */
    private Integer minimumValue;

    /**
     * Description du prérequis
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Indique si ce prérequis est actif
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /**
     * Date de création du prérequis
     */
    private LocalDateTime createdAt;

    /**
     * Date de dernière modification
     */
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Enum pour les types de prérequis
     */
    public enum PrerequisiteType {
        REQUIRED,           // Formation doit être 100% complétée
        MINIMUM_SCORE,      // Score minimum requis
        MINIMUM_TIME,       // Temps minimum requis
        MODULE_COMPLETION   // Au minimum un module doit être complété
    }
}
