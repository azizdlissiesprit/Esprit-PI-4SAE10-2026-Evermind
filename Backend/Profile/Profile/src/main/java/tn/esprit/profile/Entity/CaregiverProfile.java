package tn.esprit.profile.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "profile_caregiver")
// vvvv THESE 4 ANNOTATIONS ARE REQUIRED vvvv
@Data
@Builder             // Generates .builder()
@NoArgsConstructor   // Required for JPA/Hibernate
@AllArgsConstructor  // Required for @Builder to work
public class CaregiverProfile {

    @Id
    private Long userId;

    private String professionalTitle;
    private String affiliation;

    @ElementCollection
    private List<String> languages;

    private Integer patientsMonitored;
    private Integer hoursLogged;
    private Boolean availableForOvertime;
}