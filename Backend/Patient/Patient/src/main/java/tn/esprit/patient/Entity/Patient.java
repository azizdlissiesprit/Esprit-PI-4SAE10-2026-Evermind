package tn.esprit.patient.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.Period;

@Entity
@Table(name = "patients")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- 1. IDENTITY & DEMOGRAPHICS ---
    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(length = 10)
    private String gender; // M, F, OTHER

    private String profilePictureUrl; // For the dashboard avatar

    // --- 2. FACILITY LOCATION (Crucial for Alerts) ---
    private String roomNumber;
    private String floorNumber;
    private String bedNumber;

    // --- 3. MEDICAL CONTEXT (Static/Long-term) ---
    // Compliments assessments by providing the "Baseline"
    @Column(length = 5)
    private String bloodType;

    @Column(columnDefinition = "TEXT")
    private String medicalDiagnosis; // e.g., "Alzheimer's Stage 2, Hypertension"

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(columnDefinition = "TEXT")
    private String chronicMedications; // List of permanent meds (not daily tracking)

    // --- 4. EMERGENCY CONTACT ---
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation; // e.g., "Daughter"

    // --- 5. SYSTEM LINKING ---
    // Links this patient to a specific IoT Watch/Sensor for the Alert Service
    @Column(unique = true)
    private String wearableDeviceId;

    // Links to the Guardian User (ID from User Service)
    private Long guardianUserId;

    // Links to the Caregiver User (ID from User Service)
    @Column(name = "responsable")
    private Long responsable;

    /** 
     * Individual geofence center coordinates. 
     * Used by the simulation and tracking frontend.
     */
    private Double baseLatitude;
    private Double baseLongitude;
    private Integer geofenceRadius; // in meters

    // --- Helper Method for Frontend ---
    public int getAge() {
        if (this.dateOfBirth == null) return 0;
        return Period.between(this.dateOfBirth, LocalDate.now()).getYears();
    }
}