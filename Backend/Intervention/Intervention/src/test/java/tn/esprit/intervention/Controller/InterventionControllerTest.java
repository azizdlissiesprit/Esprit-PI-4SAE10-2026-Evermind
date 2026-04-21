package tn.esprit.intervention.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tn.esprit.intervention.Entity.Intervention;
import tn.esprit.intervention.Entity.InterventionOutcome;
import tn.esprit.intervention.Entity.InterventionStatus;
import tn.esprit.intervention.Service.IInterventionService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class InterventionControllerTest {

    private MockMvc mockMvc;

    @Mock
    private IInterventionService interventionService;

    @InjectMocks
    private InterventionController interventionController;

    private ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    private Intervention sampleIntervention;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(interventionController).build();

        sampleIntervention = Intervention.builder()
                .id(1L)
                .alertId(10L)
                .userId(5L)
                .patientId(100L)
                .startedAt(LocalDateTime.now())
                .status(InterventionStatus.EN_ROUTE)
                .notes("Dispatched to help")
                .build();
    }

    @Test
    void getAllInterventions_ShouldReturnList() throws Exception {
        List<Intervention> list = Arrays.asList(sampleIntervention);
        when(interventionService.retrieveAllInterventions()).thenReturn(list);

        mockMvc.perform(get("/intervention/retrieve-all-interventions")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].alertId").value(10L));
    }

    @Test
    void getIntervention_ShouldReturnOne() throws Exception {
        when(interventionService.retrieveIntervention(1L)).thenReturn(sampleIntervention);

        mockMvc.perform(get("/intervention/retrieve-intervention/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("EN_ROUTE"));
    }

    @Test
    void startIntervention_ShouldReturnStarted() throws Exception {
        when(interventionService.addIntervention(any(Intervention.class))).thenReturn(sampleIntervention);

        mockMvc.perform(post("/intervention/start-intervention")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleIntervention)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alertId").value(10L));
    }

    @Test
    void removeIntervention_ShouldReturnOk() throws Exception {
        doNothing().when(interventionService).removeIntervention(1L);

        mockMvc.perform(delete("/intervention/remove-intervention/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void updateStatus_ShouldReturnUpdated() throws Exception {
        Intervention updated = Intervention.builder()
                .id(1L)
                .status(InterventionStatus.IN_PERSON_ASSISTANCE)
                .build();
                
        when(interventionService.updateInterventionStatus(1L, InterventionStatus.IN_PERSON_ASSISTANCE)).thenReturn(updated);

        mockMvc.perform(put("/intervention/update-status/{id}", 1L)
                        .param("status", "IN_PERSON_ASSISTANCE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PERSON_ASSISTANCE"));
    }

    @Test
    void finishIntervention_ShouldReturnFinished() throws Exception {
        Intervention finished = Intervention.builder()
                .id(1L)
                .status(InterventionStatus.COMPLETED)
                .outcome(InterventionOutcome.ASSISTANCE_GIVEN)
                .notes("All good")
                .build();
                
        when(interventionService.finishIntervention(1L, InterventionOutcome.ASSISTANCE_GIVEN, "All good")).thenReturn(finished);

        mockMvc.perform(put("/intervention/finish-intervention/{id}", 1L)
                        .param("outcome", "ASSISTANCE_GIVEN")
                        .param("notes", "All good")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.outcome").value("ASSISTANCE_GIVEN"));
    }

    @Test
    void escalateIntervention_ShouldReturnEscalated() throws Exception {
        Intervention escalated = Intervention.builder()
                .id(1L)
                .isEscalated(true)
                .escalatedToUserId(6L)
                .build();
                
        when(interventionService.escalateIntervention(1L, 6L, "Need backup")).thenReturn(escalated);

        mockMvc.perform(post("/intervention/escalate-intervention/{id}", 1L)
                        .param("toUserId", "6")
                        .param("notes", "Need backup")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isEscalated").value(true))
                .andExpect(jsonPath("$.escalatedToUserId").value(6L));
    }

    @Test
    void getInterventionByAlert_ShouldReturnIntervention() throws Exception {
        when(interventionService.getInterventionByAlertId(10L)).thenReturn(sampleIntervention);

        mockMvc.perform(get("/intervention/by-alert/{alert-id}", 10L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alertId").value(10L));
    }

    @Test
    void getHistoryByPatient_ShouldReturnList() throws Exception {
        List<Intervention> list = Arrays.asList(sampleIntervention);
        when(interventionService.getInterventionsByPatient(100L)).thenReturn(list);

        mockMvc.perform(get("/intervention/history/patient/{patient-id}", 100L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].patientId").value(100L));
    }
}
