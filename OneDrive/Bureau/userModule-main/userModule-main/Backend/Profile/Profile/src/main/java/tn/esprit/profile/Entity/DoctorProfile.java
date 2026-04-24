package tn.esprit.profile.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profile_doctor")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfile {

    @Id
    private Long userId;

    private String specialty;
    private String hospitalAffiliation;
    private String department;
    private String licenseNumber;
    private String availabilityHours;
    private Boolean acceptUrgentConsults;
}