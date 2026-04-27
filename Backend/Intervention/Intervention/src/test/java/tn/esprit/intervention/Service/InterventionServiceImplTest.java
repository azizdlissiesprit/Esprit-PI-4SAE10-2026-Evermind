package tn.esprit.intervention.Service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.intervention.Entity.Intervention;
import tn.esprit.intervention.Entity.InterventionLog;
import tn.esprit.intervention.Entity.InterventionOutcome;
import tn.esprit.intervention.Entity.InterventionStatus;
import tn.esprit.intervention.Repository.InterventionLogRepository;
import tn.esprit.intervention.Repository.InterventionRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterventionServiceImplTest {

    @Mock
    private InterventionRepository interventionRepository;

    @Mock
    private InterventionLogRepository logRepository;

    @Mock
    private AlertClient alertClient;

    @InjectMocks
    private InterventionServiceImpl interventionService;

    private Intervention sampleIntervention;

    @BeforeEach
    void setUp() {
        sampleIntervention = Intervention.builder()
                .id(1L)
                .alertId(10L)
                .userId(5L)
                .patientId(100L)
                .startedAt(LocalDateTime.now())
                .status(InterventionStatus.EN_ROUTE)
                .notes("En route to patient")
                .build();
    }

    @Test
    void retrieveAllInterventions_ShouldReturnList() {
        when(interventionRepository.findAll()).thenReturn(Arrays.asList(sampleIntervention));

        List<Intervention> result = interventionService.retrieveAllInterventions();

        assertEquals(1, result.size());
        verify(interventionRepository, times(1)).findAll();
    }

    @Test
    void addIntervention_ShouldSetInitialValuesSaveAndNotifyAlertClient() {
        Intervention freshIntervention = new Intervention();
        freshIntervention.setAlertId(10L);
        freshIntervention.setUserId(5L);

        when(interventionRepository.save(any(Intervention.class))).thenAnswer(i -> {
            Intervention saved = i.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        // Mock saving log
        when(logRepository.save(any(InterventionLog.class))).thenReturn(new InterventionLog());

        Intervention saved = interventionService.addIntervention(freshIntervention);

        assertNotNull(saved.getStartedAt());
        assertEquals(InterventionStatus.EN_ROUTE, saved.getStatus());
        verify(interventionRepository, times(1)).save(freshIntervention);
        verify(logRepository, times(1)).save(any(InterventionLog.class));
        verify(alertClient, times(1)).takeCharge(10L);
    }

    @Test
    void retrieveIntervention_ShouldReturnIfExists() {
        when(interventionRepository.findById(1L)).thenReturn(Optional.of(sampleIntervention));

        Intervention result = interventionService.retrieveIntervention(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void retrieveIntervention_ShouldThrowExceptionIfNotExists() {
        when(interventionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> interventionService.retrieveIntervention(1L));
    }

    @Test
    void removeIntervention_ShouldDelete() {
        doNothing().when(interventionRepository).deleteById(1L);

        interventionService.removeIntervention(1L);

        verify(interventionRepository, times(1)).deleteById(1L);
    }

    @Test
    void updateInterventionStatus_ShouldUpdateSaveAndLog() {
        when(interventionRepository.findById(1L)).thenReturn(Optional.of(sampleIntervention));
        when(interventionRepository.save(any(Intervention.class))).thenAnswer(i -> i.getArgument(0));

        Intervention updated = interventionService.updateInterventionStatus(1L, InterventionStatus.IN_PERSON_ASSISTANCE);

        assertEquals(InterventionStatus.IN_PERSON_ASSISTANCE, updated.getStatus());
        verify(interventionRepository, times(1)).save(sampleIntervention);
        verify(logRepository, times(1)).save(any(InterventionLog.class));
    }

    @Test
    void finishIntervention_ShouldResolveAndLog() {
        sampleIntervention.setStartedAt(LocalDateTime.now().minusMinutes(5));
        when(interventionRepository.findById(1L)).thenReturn(Optional.of(sampleIntervention));
        when(interventionRepository.save(any(Intervention.class))).thenAnswer(i -> i.getArgument(0));

        Intervention finished = interventionService.finishIntervention(1L, InterventionOutcome.ASSISTANCE_GIVEN, "All done");

        assertEquals(InterventionOutcome.ASSISTANCE_GIVEN, finished.getOutcome());
        assertEquals("All done", finished.getNotes());
        assertEquals(InterventionStatus.COMPLETED, finished.getStatus());
        assertNotNull(finished.getCompletedAt());
        assertNotNull(finished.getDurationInSeconds());

        verify(alertClient, times(1)).resolveAlert(10L);
        verify(interventionRepository, times(1)).save(sampleIntervention);
        verify(logRepository, times(1)).save(any(InterventionLog.class));
    }

    @Test
    void getInterventionByAlertId_ShouldReturnIfExists() {
        when(interventionRepository.findByAlertId(10L)).thenReturn(Optional.of(sampleIntervention));

        Intervention result = interventionService.getInterventionByAlertId(10L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void getInterventionsByPatient_ShouldReturnList() {
        when(interventionRepository.findByPatientId(100L)).thenReturn(Arrays.asList(sampleIntervention));

        List<Intervention> result = interventionService.getInterventionsByPatient(100L);

        assertEquals(1, result.size());
    }

    @Test
    void escalateIntervention_ShouldUpdateEntityAndLog() {
        when(interventionRepository.findById(1L)).thenReturn(Optional.of(sampleIntervention));
        when(interventionRepository.save(any(Intervention.class))).thenAnswer(i -> i.getArgument(0));

        Intervention escalated = interventionService.escalateIntervention(1L, 6L, "Paramedics needed");

        assertTrue(escalated.getIsEscalated());
        assertEquals(6L, escalated.getEscalatedToUserId());
        verify(interventionRepository, times(1)).save(sampleIntervention);
        verify(logRepository, times(1)).save(any(InterventionLog.class));
    }
}
