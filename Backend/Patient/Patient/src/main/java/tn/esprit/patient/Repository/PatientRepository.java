package tn.esprit.patient.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.patient.Entity.Patient;


import java.util.Optional;
import java.util.List;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    // Find by Guardian (for Family Dashboard)
    List<Patient> findByGuardianUserId(Long guardianUserId);

    // Find by IoT Device (Used by Alert Service via Feign)
    Optional<Patient> findByWearableDeviceId(String wearableDeviceId);

    // Search for Doctors/Nurses
    List<Patient> findByLastNameContainingIgnoreCase(String lastName);

    // Find by Caregiver
    List<Patient> findByResponsable(Long responsable);
}