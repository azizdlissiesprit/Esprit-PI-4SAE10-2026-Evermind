package tn.esprit.patient.Service;

import tn.esprit.patient.Entity.Patient;

import java.util.List;
import java.util.Optional;

public interface IPatientService {

    // --- CRUD Operations ---
    Patient create(Patient patient);

    Patient update(Long id, Patient patient);

    Patient getById(Long id);

    List<Patient> getAll();

    void delete(Long id);

    // --- Specialized Searches ---
    List<Patient> getByGuardian(Long guardianUserId);

    Optional<Patient> getByWearableDevice(String deviceId);

    // Search by Name (Partial Match)
    List<Patient> searchByName(String lastName);
}
