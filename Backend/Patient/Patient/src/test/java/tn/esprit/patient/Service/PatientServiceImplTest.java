package tn.esprit.patient.Service;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.patient.Entity.Patient;
import tn.esprit.patient.Repository.PatientRepository;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceImplTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientServiceImpl patientService;

    private Patient samplePatient;

    @BeforeEach
    void setUp() {
        samplePatient = Patient.builder()
                .id(1L)
                .firstName("Alice")
                .lastName("Smith")
                .dateOfBirth(LocalDate.of(1945, 8, 15))
                .gender("F")
                .wearableDeviceId("DEV-999")
                .guardianUserId(5L)
                .responsable(10L)
                .build();
    }

    @Test
    void create_ShouldSaveAndReturnPatient() {
        when(patientRepository.findByWearableDeviceId(anyString())).thenReturn(Optional.empty());
        when(patientRepository.save(any(Patient.class))).thenAnswer(i -> {
            Patient p = i.getArgument(0);
            p.setId(2L);
            return p;
        });

        Patient created = patientService.create(samplePatient);

        assertNotNull(created);
        assertEquals(2L, created.getId());
        verify(patientRepository, times(1)).save(samplePatient);
    }

    @Test
    void create_ShouldThrowExceptionIfDeviceAlreadyExists() {
        when(patientRepository.findByWearableDeviceId("DEV-999")).thenReturn(Optional.of(new Patient()));

        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
            patientService.create(samplePatient);
        });

        assertEquals("Device ID already assigned to another patient.", thrown.getMessage());
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void update_ShouldUpdateAndReturnPatient() {
        Patient updatedDetails = new Patient();
        updatedDetails.setFirstName("Alicia");
        updatedDetails.setLastName("Smith");

        when(patientRepository.findById(1L)).thenReturn(Optional.of(samplePatient));
        when(patientRepository.save(any(Patient.class))).thenAnswer(i -> i.getArgument(0));

        Patient result = patientService.update(1L, updatedDetails);

        assertEquals("Alicia", result.getFirstName());
        verify(patientRepository, times(1)).save(samplePatient);
    }

    @Test
    void update_ShouldThrowExceptionIfNotFound() {
        when(patientRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            patientService.update(1L, samplePatient);
        });
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void getById_ShouldReturnIfExists() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(samplePatient));

        Patient result = patientService.getById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void getById_ShouldThrowExceptionIfNotExists() {
        when(patientRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> patientService.getById(1L));
    }

    @Test
    void getAll_ShouldReturnList() {
        when(patientRepository.findAll()).thenReturn(Arrays.asList(samplePatient));

        List<Patient> result = patientService.getAll();

        assertEquals(1, result.size());
        verify(patientRepository, times(1)).findAll();
    }

    @Test
    void delete_ShouldCallDelete() {
        when(patientRepository.existsById(1L)).thenReturn(true);
        doNothing().when(patientRepository).deleteById(1L);

        patientService.delete(1L);

        verify(patientRepository, times(1)).deleteById(1L);
    }

    @Test
    void delete_ShouldThrowExceptionIfNotExists() {
        when(patientRepository.existsById(1L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> patientService.delete(1L));
        verify(patientRepository, never()).deleteById(anyLong());
    }

    @Test
    void getByGuardian_ShouldReturnList() {
        when(patientRepository.findByGuardianUserId(5L)).thenReturn(Arrays.asList(samplePatient));

        List<Patient> result = patientService.getByGuardian(5L);

        assertEquals(1, result.size());
        assertEquals(5L, result.get(0).getGuardianUserId());
        verify(patientRepository, times(1)).findByGuardianUserId(5L);
    }

    @Test
    void getByWearableDevice_ShouldReturnOptional() {
        when(patientRepository.findByWearableDeviceId("DEV-999")).thenReturn(Optional.of(samplePatient));

        Optional<Patient> result = patientService.getByWearableDevice("DEV-999");

        assertTrue(result.isPresent());
        assertEquals("DEV-999", result.get().getWearableDeviceId());
    }

    @Test
    void searchByName_ShouldReturnMatches() {
        when(patientRepository.findByLastNameContainingIgnoreCase("Smith")).thenReturn(Arrays.asList(samplePatient));

        List<Patient> result = patientService.searchByName("Smith");

        assertEquals(1, result.size());
        assertEquals("Smith", result.get(0).getLastName());
    }

    @Test
    void getPatientsByResponsable_ShouldReturnList() {
        when(patientRepository.findByResponsable(10L)).thenReturn(Arrays.asList(samplePatient));

        List<Patient> result = patientService.getPatientsByResponsable(10L);

        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getResponsable());
    }
}
