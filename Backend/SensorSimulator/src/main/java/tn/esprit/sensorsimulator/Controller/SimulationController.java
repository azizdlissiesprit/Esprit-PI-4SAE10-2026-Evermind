package tn.esprit.sensorsimulator.Controller;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import tn.esprit.sensorsimulator.Entity.AbnormalEvent;
import tn.esprit.sensorsimulator.Entity.AbnormalEventType;
import tn.esprit.sensorsimulator.Entity.SensorReading;
import tn.esprit.sensorsimulator.Repository.AbnormalEventRepository;
import tn.esprit.sensorsimulator.Repository.SensorReadingRepository;
import tn.esprit.sensorsimulator.Service.SimulationEngine;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/simulation")
@AllArgsConstructor
@Slf4j
public class SimulationController {

    private final SimulationEngine simulationEngine;
    private final SensorReadingRepository readingRepository;
    private final AbnormalEventRepository eventRepository;

    // ====== Simulation Lifecycle ======

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        log.info("📡 GET /simulation/status");
        Map<String, Object> status = new HashMap<>();
        status.put("running", simulationEngine.isRunning());
        status.put("cycleCount", simulationEngine.getCycleCount());
        status.put("totalReadings", readingRepository.count());
        status.put("totalEvents", eventRepository.count());
        status.put("accidentProbability", simulationEngine.getAccidentProbability());
        log.info("📊 Simulation status: running={}, cycles={}", simulationEngine.isRunning(), simulationEngine.getCycleCount());
        return status;
    }

    @PostMapping("/start")
    public Map<String, Object> startSimulation() {
        log.info("📡 POST /simulation/start");
        simulationEngine.start();
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Simulation STARTED");
        response.put("running", true);
        return response;
    }

    @PostMapping("/stop")
    public Map<String, Object> stopSimulation() {
        log.info("📡 POST /simulation/stop");
        simulationEngine.stop();
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Simulation STOPPED");
        response.put("running", false);
        response.put("cycleCount", simulationEngine.getCycleCount());
        return response;
    }

    // ====== Accident Triggers ======

    @PostMapping("/trigger-accident/{patientId}")
    public AbnormalEvent triggerRandomAccident(@PathVariable("patientId") Long patientId) {
        log.info("📡 POST /simulation/trigger-accident/{} - RANDOM type", patientId);
        return simulationEngine.triggerAccidentForPatient(patientId);
    }

    @PostMapping("/trigger-accident/{patientId}/{eventType}")
    public AbnormalEvent triggerSpecificAccident(@PathVariable("patientId") Long patientId,
                                                 @PathVariable("eventType") AbnormalEventType eventType) {
        log.info("📡 POST /simulation/trigger-accident/{}/{}", patientId, eventType);
        return simulationEngine.triggerSpecificAccident(patientId, eventType);
    }

    // ====== Reading Queries ======

    @GetMapping("/readings/patient/{patientId}")
    public List<SensorReading> getReadingsForPatient(@PathVariable("patientId") Long patientId) {
        log.info("📡 GET /simulation/readings/patient/{}", patientId);
        return readingRepository.findTop50ByPatientIdOrderByTimestampDesc(patientId);
    }

    @GetMapping("/readings/patient/{patientId}/latest")
    public List<SensorReading> getLatestReadings(@PathVariable("patientId") Long patientId) {
        log.info("📡 GET /simulation/readings/patient/{}/latest", patientId);
        return readingRepository.findTop50ByPatientIdOrderByTimestampDesc(patientId);
    }

    @GetMapping("/readings/patient/{patientId}/anomalies")
    public List<SensorReading> getAnomalousReadings(@PathVariable("patientId") Long patientId) {
        log.info("📡 GET /simulation/readings/patient/{}/anomalies", patientId);
        return readingRepository.findByPatientIdAndIsAnomalousTrue(patientId);
    }

    // ====== Event Queries ======

    @GetMapping("/events")
    public List<AbnormalEvent> getAllEvents() {
        log.info("📡 GET /simulation/events");
        return eventRepository.findAll();
    }

    @GetMapping("/events/patient/{patientId}")
    public List<AbnormalEvent> getEventsForPatient(@PathVariable("patientId") Long patientId) {
        log.info("📡 GET /simulation/events/patient/{}", patientId);
        return eventRepository.findByPatientIdOrderByDetectedAtDesc(patientId);
    }

    // ====== Configuration ======

    @GetMapping("/config")
    public Map<String, Object> getConfig() {
        log.info("📡 GET /simulation/config");
        Map<String, Object> config = new HashMap<>();
        config.put("accidentProbability", simulationEngine.getAccidentProbability());
        config.put("running", simulationEngine.isRunning());
        config.put("cycleCount", simulationEngine.getCycleCount());
        return config;
    }

    @PutMapping("/config")
    public Map<String, Object> updateConfig(@RequestBody Map<String, Object> configUpdates) {
        log.info("📡 PUT /simulation/config - updates: {}", configUpdates);

        if (configUpdates.containsKey("accidentProbability")) {
            double newProb = ((Number) configUpdates.get("accidentProbability")).doubleValue();
            simulationEngine.setAccidentProbability(newProb);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Configuration updated");
        response.put("accidentProbability", simulationEngine.getAccidentProbability());
        return response;
    }
}
