package tn.esprit.patient.Controller;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.patient.Entity.MedicalReport;
import tn.esprit.patient.Service.IMedicalReportService;

import java.util.List;

@RestController
@RequestMapping("/patient/medical-report")
@AllArgsConstructor
public class MedicalReportController {

    @Autowired
    IMedicalReportService medicalReportService;

    @PostMapping
    public MedicalReport create(@RequestBody MedicalReport report) {
        return medicalReportService.create(report);
    }

    @GetMapping("/patient/{patientId}")
    public List<MedicalReport> getByPatientId(@PathVariable Long patientId) {
        return medicalReportService.getByPatientId(patientId);
    }
}
