package tn.esprit.formation.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormationStatDTO {
    private String titre;
    private Long nombreInscriptions;
}
