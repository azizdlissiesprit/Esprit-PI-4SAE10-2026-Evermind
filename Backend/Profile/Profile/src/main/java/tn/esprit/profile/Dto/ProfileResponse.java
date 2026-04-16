package tn.esprit.profile.Dto;
import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class ProfileResponse {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;

    // Dynamic map for specific profile details
    private Map<String, Object> profileDetails;
}