package tn.esprit.sensorsimulator.Controller;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import tn.esprit.sensorsimulator.Entity.Sensor;
import tn.esprit.sensorsimulator.Service.SensorService;

import java.util.List;

@RestController
@RequestMapping("/sensor")
@AllArgsConstructor
@Slf4j
public class SensorController {

    private final SensorService sensorService;

    @GetMapping("/all")
    public List<Sensor> getAllSensors() {
        log.info("📡 GET /sensor/all");
        return sensorService.getAllSensors();
    }

    @GetMapping("/{id}")
    public Sensor getSensorById(@PathVariable("id") Long id) {
        log.info("📡 GET /sensor/{}", id);
        return sensorService.getSensorById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<Sensor> getSensorsByPatient(@PathVariable("patientId") Long patientId) {
        log.info("📡 GET /sensor/patient/{}", patientId);
        return sensorService.getSensorsByPatient(patientId);
    }

    @PostMapping("/add")
    public Sensor addSensor(@RequestBody Sensor sensor) {
        log.info("📡 POST /sensor/add - code={}, type={}", sensor.getSensorCode(), sensor.getSensorType());
        return sensorService.addSensor(sensor);
    }

    @PutMapping("/update/{id}")
    public Sensor updateSensor(@PathVariable("id") Long id, @RequestBody Sensor sensor) {
        log.info("📡 PUT /sensor/update/{}", id);
        return sensorService.updateSensor(id, sensor);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteSensor(@PathVariable("id") Long id) {
        log.info("📡 DELETE /sensor/delete/{}", id);
        sensorService.deleteSensor(id);
    }
}
