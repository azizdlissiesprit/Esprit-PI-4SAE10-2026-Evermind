package tn.esprit.alert.Service;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.alert.Entity.Alert;
import tn.esprit.alert.Entity.Severite;
import tn.esprit.alert.Entity.StatutAlerte;
import tn.esprit.alert.Entity.TypeAlerte;
import tn.esprit.alert.Repository.AlertRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertServiceImplTest {

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private GoogleGeminiService googleGeminiService;

    @Mock
    private PatientClient patientClient;

    @InjectMocks
    private AlertServiceImpl alertService;

    private Alert sampleAlert;

    @BeforeEach
    void setUp() {
        sampleAlert = new Alert();
        sampleAlert.setAlertId(1L);
        sampleAlert.setPatientId(100L);
        sampleAlert.setTypeAlerte(TypeAlerte.FALL_DETECTION);
        sampleAlert.setSeverite(Severite.HAUTE);
        sampleAlert.setStatut(StatutAlerte.NOUVELLE);
        sampleAlert.setDateCreation(LocalDateTime.now());
        sampleAlert.setMessage("Patient fall detected");
    }

    @Test
    void addAlert_ShouldSetContextAndAnalysisAndSave() {
        // Arrange
        Map<String, Object> mockPatientData = new HashMap<>();
        mockPatientData.put("dateOfBirth", "1950-01-01");
        mockPatientData.put("medicalDiagnosis", "Alzheimer");
        mockPatientData.put("chronicMedications", "Donepezil");

        when(patientClient.getPatientById(100L)).thenReturn(mockPatientData);
        when(googleGeminiService.analyzeAlert(anyString(), anyString(), anyString()))
                .thenReturn("critical situation");
        when(alertRepository.save(any(Alert.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Alert savedAlert = alertService.addAlert(sampleAlert);

        // Assert
        assertNotNull(savedAlert);
        assertEquals(StatutAlerte.NOUVELLE, savedAlert.getStatut());
        assertEquals(Severite.CRITIQUE, savedAlert.getSeverite());
        assertEquals(90, savedAlert.getAiRiskScore());
        verify(patientClient, times(1)).getPatientById(100L);
        verify(googleGeminiService, times(1)).analyzeAlert(anyString(), anyString(), anyString());
        verify(alertRepository, times(1)).save(sampleAlert);
    }

    @Test
    void retrieveAllAlerts_ShouldReturnList() {
        // Arrange
        when(alertRepository.findAll()).thenReturn(List.of(sampleAlert));

        // Act
        List<Alert> alerts = alertService.retrieveAllAlerts();

        // Assert
        assertEquals(1, alerts.size());
        verify(alertRepository, times(1)).findAll();
    }

    @Test
    void retrieveAlert_ShouldReturnAlertIfExists() {
        // Arrange
        when(alertRepository.findById(1L)).thenReturn(Optional.of(sampleAlert));

        // Act
        Alert result = alertService.retrieveAlert(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getAlertId());
        verify(alertRepository, times(1)).findById(1L);
    }

    @Test
    void updateStatus_ShouldChangeStatusAndSave() {
        // Arrange
        when(alertRepository.findById(1L)).thenReturn(Optional.of(sampleAlert));
        when(alertRepository.save(any(Alert.class))).thenReturn(sampleAlert);

        // Act
        Alert updated = alertService.updateStatus(1L, StatutAlerte.EN_COURS);

        // Assert
        assertEquals(StatutAlerte.EN_COURS, updated.getStatut());
        verify(alertRepository, times(1)).findById(1L);
        verify(alertRepository, times(1)).save(sampleAlert);
    }

    @Test
    void updateStatus_ShouldThrowExceptionIfNotFound() {
        // Arrange
        when(alertRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(EntityNotFoundException.class, () ->
                alertService.updateStatus(1L, StatutAlerte.EN_COURS)
        );

        assertEquals("Alert not found", exception.getMessage());
        verify(alertRepository, never()).save(any(Alert.class));
    }

    @Test
    void ignoreAlert_ShouldSetStatusToIgnoree() {
        // Arrange
        when(alertRepository.findById(1L)).thenReturn(Optional.of(sampleAlert));
        when(alertRepository.save(any(Alert.class))).thenReturn(sampleAlert);

        // Act
        Alert ignored = alertService.ignoreAlert(1L);

        // Assert
        assertEquals(StatutAlerte.IGNOREE, ignored.getStatut());
        verify(alertRepository, times(1)).save(sampleAlert);
    }

    @Test
    void resolveAlert_ShouldSetStatusToResolue() {
        // Arrange
        when(alertRepository.findById(1L)).thenReturn(Optional.of(sampleAlert));
        when(alertRepository.save(any(Alert.class))).thenReturn(sampleAlert);

        // Act
        Alert resolved = alertService.resolveAlert(1L);

        // Assert
        assertEquals(StatutAlerte.RESOLUE, resolved.getStatut());
        verify(alertRepository, times(1)).save(sampleAlert);
    }

    @Test
    void removeAlert_ShouldDeleteAlert() {
        // Arrange
        doNothing().when(alertRepository).deleteById(1L);

        // Act
        alertService.removeAlert(1L);

        // Assert
        verify(alertRepository, times(1)).deleteById(1L);
    }
}
