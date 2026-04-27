package tn.esprit.sensorsimulator.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_readings", indexes = {
    @Index(name = "idx_reading_patient", columnList = "patientId"),
    @Index(name = "idx_reading_sensor", columnList = "sensorId"),
    @Index(name = "idx_reading_timestamp", columnList = "timestamp")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long sensorId;

    /** Denormalized for fast queries without joining sensor table */
    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    // ====== Heart Rate Monitor Fields ======
    /** Beats per minute. Normal elderly range: 60-85 BPM */
    private Double heartRate;

    // ====== Accelerometer Fields ======
    /** G-force on X axis. Normal walking ~0.2-0.5G */
    private Double accelerationX;
    /** G-force on Y axis. Normal walking ~0.1-0.3G */
    private Double accelerationY;
    /** G-force on Z axis. Normal standing ~1.0G (gravity) */
    private Double accelerationZ;

    // ====== GPS Tracker Fields ======
    /** Latitude coordinate */
    private Double latitude;
    /** Longitude coordinate */
    private Double longitude;

    // ====== Motion Detector Fields ======
    /** Whether motion was detected in the room */
    private Boolean motionDetected;

    // ====== Medication Box Fields ======
    /** Whether the medication box was opened */
    private Boolean medicationBoxOpened;

    // ====== Anomaly Flag ======
    /** Set to true if the anomaly detection engine flags this reading */
    @Column(nullable = false)
    private Boolean isAnomalous;

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
        if (this.isAnomalous == null) {
            this.isAnomalous = false;
        }
    }
}
