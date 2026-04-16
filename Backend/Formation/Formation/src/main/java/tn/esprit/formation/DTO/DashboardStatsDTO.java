package tn.esprit.formation.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private List<FormationStatDTO> topFormations;
    private Double tauxReussiteGlobal;
    private Long utilisateursActifs30Jours;
}
