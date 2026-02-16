package tn.esprit.profile.Dto;
import lombok.Data;

@Data
public class UserVo {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String userType; // "AIDANT", "MEDECIN", etc.
}