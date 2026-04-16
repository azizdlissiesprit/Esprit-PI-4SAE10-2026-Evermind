package tn.esprit.formation.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityPingRequest {

    private Long userId;
    private Long courseId;
    private String activityType; // "click", "scroll", "keypress", "page_view"
    private Boolean isActive;

}
