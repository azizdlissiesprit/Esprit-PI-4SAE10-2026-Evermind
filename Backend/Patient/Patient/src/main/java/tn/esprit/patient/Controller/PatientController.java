package tn.esprit.patient.Controller;


import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.patient.Entity.Patient;
import tn.esprit.patient.Service.IPatientService;

import java.util.List;

@RestController
@RequestMapping("/patient")

@AllArgsConstructor
public class PatientController {
    @Autowired
    IPatientService service;

    @PostMapping
    public Patient create(@RequestBody Patient patient) {
        return service.create(patient);
    }

    @PutMapping("/{id}")
    public Patient update(@PathVariable Long id, @RequestBody Patient patient) {
        return service.update(id, patient);
    }

    @GetMapping("/{id}")
    public Patient getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public List<Patient> getAll() {
        return service.getAll();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
