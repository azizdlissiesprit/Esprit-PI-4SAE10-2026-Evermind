package tn.esprit.profile.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profile_guardian")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuardianProfile {

    @Id
    private Long userId;

    private String relationToPatient;
    private String legalStatus; // e.g. "Power of Attorney"
    private String address;
    private String subscriptionPlan;
    private Boolean vacationMode;
}