package tn.esprit.sensorsimulator.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sensors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique sensor identifier, e.g. "HR-001". Maps to Patient.wearableDeviceId for wrist sensors. */
    @Column(unique = true, nullable = false)
    private String sensorCode;

    /** Reference to the patient in the Patient microservice */
    @Column(nullable = false)
    private Long patientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SensorType sensorType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SensorStatus status;

    /** When this sensor was first activated */
    private LocalDateTime installedAt;

    /** 
     * Baseline location for GPS sensors. 
     * If null, falls back to global simulation defaults.
     */
    private Double baseLatitude;
    private Double baseLongitude;
    private Integer geofenceRadius; // in meters

    @PrePersist
    protected void onCreate() {
        if (this.installedAt == null) {
            this.installedAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = SensorStatus.ACTIVE;
        }
        // Default to Tunis area if not specified
        if (this.baseLatitude == null) this.baseLatitude = 36.8065;
        if (this.baseLongitude == null) this.baseLongitude = 10.1815;
        if (this.geofenceRadius == null) this.geofenceRadius = 100;
    }
}
