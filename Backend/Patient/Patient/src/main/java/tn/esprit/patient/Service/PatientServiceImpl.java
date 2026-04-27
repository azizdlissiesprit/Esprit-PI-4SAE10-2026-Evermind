package tn.esprit.patient.Service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.patient.Entity.Patient;
import tn.esprit.patient.Repository.PatientRepository;


import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements IPatientService {

    private final PatientRepository repository;

    @Override
    @Transactional
    public Patient create(Patient patient) {
        // Business Rule: Ensure wearable ID is unique if provided
        if (patient.getWearableDeviceId() != null &&
                repository.findByWearableDeviceId(patient.getWearableDeviceId()).isPresent()) {
            throw new IllegalArgumentException("Device ID already assigned to another patient.");
        }
        return repository.save(patient);
    }

    @Override
    @Transactional
    public Patient update(Long id, Patient updated) {
        Patient existing = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + id));

        // Update Fields
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setDateOfBirth(updated.getDateOfBirth());
        existing.setGender(updated.getGender());
        existing.setProfilePictureUrl(updated.getProfilePictureUrl());

        // Medical Context (Update Baseline)
        existing.setBloodType(updated.getBloodType());
        existing.setMedicalDiagnosis(updated.getMedicalDiagnosis());
        existing.setAllergies(updated.getAllergies());
        existing.setChronicMedications(updated.getChronicMedications());

        // Location Update
        existing.setRoomNumber(updated.getRoomNumber());
        existing.setFloorNumber(updated.getFloorNumber());
        existing.setBedNumber(updated.getBedNumber());

        // Emergency Contact Update
        existing.setEmergencyContactName(updated.getEmergencyContactName());
        existing.setEmergencyContactPhone(updated.getEmergencyContactPhone());
        existing.setEmergencyContactRelation(updated.getEmergencyContactRelation());

        // System Linking
        existing.setWearableDeviceId(updated.getWearableDeviceId());
        existing.setGuardianUserId(updated.getGuardianUserId());
        existing.setResponsable(updated.getResponsable());

        return repository.save(existing);
    }

    @Override
    public Patient getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + id));
    }

    @Override
    public List<Patient> getAll() {
        return repository.findAll();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Patient not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<Patient> getByGuardian(Long guardianUserId) {
        return repository.findByGuardianUserId(guardianUserId);
    }

    @Override
    public Optional<Patient> getByWearableDevice(String deviceId) {
        return repository.findByWearableDeviceId(deviceId);
    }

    @Override
    public List<Patient> searchByName(String lastName) {
        return repository.findByLastNameContainingIgnoreCase(lastName);
    }

    @Override
    public List<Patient> getPatientsByResponsable(Long responsableId) {
        return repository.findByResponsable(responsableId);
    }
}
