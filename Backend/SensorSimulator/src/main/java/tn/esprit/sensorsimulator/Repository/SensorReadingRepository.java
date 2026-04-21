package tn.esprit.sensorsimulator.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.sensorsimulator.Entity.SensorReading;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    List<SensorReading> findByPatientIdOrderByTimestampDesc(Long patientId);

    List<SensorReading> findTop50ByPatientIdOrderByTimestampDesc(Long patientId);

    List<SensorReading> findBySensorIdOrderByTimestampDesc(Long sensorId);

    List<SensorReading> findTop10BySensorIdOrderByTimestampDesc(Long sensorId);

    List<SensorReading> findByPatientIdAndIsAnomalousTrue(Long patientId);

    List<SensorReading> findByPatientIdAndTimestampBetween(Long patientId, LocalDateTime start, LocalDateTime end);

    long countByPatientId(Long patientId);
}
