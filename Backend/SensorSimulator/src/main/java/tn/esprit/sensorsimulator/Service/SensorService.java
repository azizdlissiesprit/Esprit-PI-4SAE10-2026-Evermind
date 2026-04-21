package tn.esprit.sensorsimulator.Service;

import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.sensorsimulator.Entity.Sensor;
import tn.esprit.sensorsimulator.Entity.SensorStatus;
import tn.esprit.sensorsimulator.Repository.SensorRepository;

import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class SensorService {

    private final SensorRepository sensorRepository;

    public List<Sensor> getAllSensors() {
        log.debug("🔍 Fetching all sensors from database");
        List<Sensor> sensors = sensorRepository.findAll();
        log.info("📊 Retrieved {} sensors", sensors.size());
        return sensors;
    }

    public Sensor getSensorById(Long id) {
        log.debug("🔍 Looking up sensor with id={}", id);
        return sensorRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("🚨 Sensor not found with id={}", id);
                    return new EntityNotFoundException("Sensor not found with id: " + id);
                });
    }

    public List<Sensor> getSensorsByPatient(Long patientId) {
        log.debug("🔍 Fetching sensors for patientId={}", patientId);
        List<Sensor> sensors = sensorRepository.findByPatientId(patientId);
        log.info("📊 Found {} sensors for patientId={}", sensors.size(), patientId);
        return sensors;
    }

    public List<Sensor> getActiveSensorsByPatient(Long patientId) {
        log.debug("🔍 Fetching ACTIVE sensors for patientId={}", patientId);
        List<Sensor> sensors = sensorRepository.findByPatientIdAndStatus(patientId, SensorStatus.ACTIVE);
        log.info("📊 Found {} active sensors for patientId={}", sensors.size(), patientId);
        return sensors;
    }

    public Sensor addSensor(Sensor sensor) {
        log.info("🚀 Registering new sensor: code={}, type={}, patientId={}",
                sensor.getSensorCode(), sensor.getSensorType(), sensor.getPatientId());
        Sensor saved = sensorRepository.save(sensor);
        log.info("✅ Sensor registered successfully with id={}", saved.getId());
        return saved;
    }

    public Sensor updateSensor(Long id, Sensor updatedSensor) {
        log.info("🔄 Updating sensor id={}", id);
        Sensor existing = getSensorById(id);
        existing.setSensorCode(updatedSensor.getSensorCode());
        existing.setPatientId(updatedSensor.getPatientId());
        existing.setSensorType(updatedSensor.getSensorType());
        existing.setStatus(updatedSensor.getStatus());
        Sensor saved = sensorRepository.save(existing);
        log.info("✅ Sensor id={} updated successfully", saved.getId());
        return saved;
    }

    public void deleteSensor(Long id) {
        log.warn("⚠️ Deleting sensor id={}", id);
        sensorRepository.deleteById(id);
        log.info("✅ Sensor id={} deleted", id);
    }
}
