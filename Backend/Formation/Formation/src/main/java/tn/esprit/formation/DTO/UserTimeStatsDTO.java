package tn.esprit.formation.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTimeStatsDTO {

    private Long userId;
    private Long courseId;
    private Long totalTimeSpent; // en secondes
    private Long totalTimeSpentMinutes;
    private Integer sessionCount;
    private String formattedTime; // "2h 30m 15s"
    private Double estimatedCompletion; // pourcentage

}
