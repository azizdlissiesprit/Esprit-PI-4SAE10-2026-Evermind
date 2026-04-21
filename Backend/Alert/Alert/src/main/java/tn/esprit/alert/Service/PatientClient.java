package tn.esprit.alert.Service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

// Using Eureka discovery name "PATIENT-SERVICE"
@FeignClient(name = "PATIENT-SERVICE")
public interface PatientClient {

    @GetMapping("/patients/retrieve-patient/{id}")
    Map<String, Object> getPatientById(@PathVariable("id") Long id);

}
