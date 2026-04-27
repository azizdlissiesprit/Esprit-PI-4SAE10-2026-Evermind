package tn.esprit.sensorsimulator.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.sensorsimulator.Entity.Sensor;
import tn.esprit.sensorsimulator.Entity.SensorStatus;
import tn.esprit.sensorsimulator.Entity.SensorType;

import java.util.List;
import java.util.Optional;

@Repository
public interface SensorRepository extends JpaRepository<Sensor, Long> {

    List<Sensor> findByPatientId(Long patientId);

    List<Sensor> findByStatus(SensorStatus status);

    List<Sensor> findByPatientIdAndStatus(Long patientId, SensorStatus status);

    Optional<Sensor> findBySensorCode(String sensorCode);
    
    boolean existsBySensorCode(String sensorCode);

    Optional<Sensor> findByPatientIdAndSensorType(Long patientId, SensorType sensorType);
}
