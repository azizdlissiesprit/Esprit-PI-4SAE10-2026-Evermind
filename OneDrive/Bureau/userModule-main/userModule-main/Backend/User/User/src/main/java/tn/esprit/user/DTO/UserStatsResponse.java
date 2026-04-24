package tn.esprit.user.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long bannedUsers;
    private long admins;
    private long aidants;
    private long medecins;
    private long responsables;
}
