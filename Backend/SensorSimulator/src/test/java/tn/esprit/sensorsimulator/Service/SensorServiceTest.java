package tn.esprit.sensorsimulator.Service;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.sensorsimulator.Entity.Sensor;
import tn.esprit.sensorsimulator.Entity.SensorStatus;
import tn.esprit.sensorsimulator.Entity.SensorType;
import tn.esprit.sensorsimulator.Repository.SensorRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SensorServiceTest {

    @Mock
    private SensorRepository sensorRepository;

    @InjectMocks
    private SensorService sensorService;

    private Sensor sensor;

    @BeforeEach
    void setUp() {
        sensor = new Sensor();
        sensor.setId(1L);
        sensor.setSensorCode("SENS-123");
        sensor.setSensorType(SensorType.HEART_RATE_MONITOR);
        sensor.setPatientId(100L);
        sensor.setStatus(SensorStatus.ACTIVE);
    }

    @Test
    void getAllSensors_ShouldReturnList() {
        when(sensorRepository.findAll()).thenReturn(List.of(sensor));

        List<Sensor> result = sensorService.getAllSensors();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(sensorRepository, times(1)).findAll();
    }

    @Test
    void getSensorById_ShouldReturnSensor() {
        when(sensorRepository.findById(1L)).thenReturn(Optional.of(sensor));

        Sensor result = sensorService.getSensorById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("SENS-123", result.getSensorCode());
        verify(sensorRepository, times(1)).findById(1L);
    }

    @Test
    void getSensorById_ShouldThrowExceptionIfNotFound() {
        when(sensorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> sensorService.getSensorById(99L));
        verify(sensorRepository, times(1)).findById(99L);
    }

    @Test
    void getSensorsByPatient_ShouldReturnList() {
        when(sensorRepository.findByPatientId(100L)).thenReturn(List.of(sensor));

        List<Sensor> result = sensorService.getSensorsByPatient(100L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(sensorRepository, times(1)).findByPatientId(100L);
    }

    @Test
    void getActiveSensorsByPatient_ShouldReturnActiveList() {
        when(sensorRepository.findByPatientIdAndStatus(100L, SensorStatus.ACTIVE)).thenReturn(List.of(sensor));

        List<Sensor> result = sensorService.getActiveSensorsByPatient(100L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(sensorRepository, times(1)).findByPatientIdAndStatus(100L, SensorStatus.ACTIVE);
    }

    @Test
    void addSensor_ShouldReturnSavedSensor() {
        when(sensorRepository.save(any(Sensor.class))).thenReturn(sensor);

        Sensor result = sensorService.addSensor(sensor);

        assertNotNull(result);
        assertEquals("SENS-123", result.getSensorCode());
        verify(sensorRepository, times(1)).save(sensor);
    }

    @Test
    void updateSensor_ShouldModifyAndReturnSensor() {
        when(sensorRepository.findById(1L)).thenReturn(Optional.of(sensor));
        when(sensorRepository.save(any(Sensor.class))).thenReturn(sensor);

        Sensor updatedInfo = new Sensor();
        updatedInfo.setSensorCode("SENS-999");
        updatedInfo.setSensorType(SensorType.MOTION_DETECTOR);
        updatedInfo.setPatientId(200L);
        updatedInfo.setStatus(SensorStatus.INACTIVE);

        Sensor result = sensorService.updateSensor(1L, updatedInfo);

        assertNotNull(result);
        assertEquals("SENS-999", sensor.getSensorCode());
        assertEquals(SensorType.MOTION_DETECTOR, sensor.getSensorType());
        assertEquals(200L, sensor.getPatientId());
        assertEquals(SensorStatus.INACTIVE, sensor.getStatus());
        verify(sensorRepository, times(1)).findById(1L);
        verify(sensorRepository, times(1)).save(sensor);
    }

    @Test
    void deleteSensor_ShouldCallDelete() {
        doNothing().when(sensorRepository).deleteById(1L);

        sensorService.deleteSensor(1L);

        verify(sensorRepository, times(1)).deleteById(1L);
    }
}
