package tn.esprit.formation.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionStatsDTO {

    private Long sessionId;
    private Long userId;
    private Long courseId;
    private LocalDateTime sessionStartTime;
    private LocalDateTime sessionEndTime;
    private Long activeTimeInSeconds;
    private String formattedTime;
    private Boolean isActive;

}
