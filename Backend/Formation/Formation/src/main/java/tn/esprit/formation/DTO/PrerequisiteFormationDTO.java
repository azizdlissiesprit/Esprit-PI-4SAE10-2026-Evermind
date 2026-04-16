package tn.esprit.formation.DTO;

import lombok.*;

/**
 * DTO pour les prérequis de formation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrerequisiteFormationDTO {

    private Long id;

    private Long requiredFormationId;
    private String requiredFormationTitle;

    private Long dependentFormationId;
    private String dependentFormationTitle;

    private String prerequisiteType;

    private Integer minimumValue;

    private String description;

    private Boolean active;
}
