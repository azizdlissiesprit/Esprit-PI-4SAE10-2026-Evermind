package tn.esprit.alert.Controller;

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
import tn.esprit.alert.Entity.Alert;
import tn.esprit.alert.Entity.Severite;
import tn.esprit.alert.Entity.StatutAlerte;
import tn.esprit.alert.Entity.TypeAlerte;
import tn.esprit.alert.Repository.AlertRepository;
import tn.esprit.alert.Service.IAlertService;
import tn.esprit.alert.Service.PredictiveAnalysisService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AlertControllerTest {

    private MockMvc mockMvc;

    @Mock
    private IAlertService alertService;

    @Mock
    private PredictiveAnalysisService predictiveService;

    @Mock
    private AlertRepository alertRepository;

    @InjectMocks
    private AlertController alertController;

    private ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    private Alert sampleAlert;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(alertController).build();

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
    void getAlerts_ShouldReturnListOfAlerts() throws Exception {
        List<Alert> alerts = Arrays.asList(sampleAlert);
        when(alertService.retrieveAllAlerts()).thenReturn(alerts);

        mockMvc.perform(get("/alert/retrieve-all-alerts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].message").value("Patient fall detected"))
                .andExpect(jsonPath("$[0].patientId").value(100));
    }

    @Test
    void addAlert_ShouldReturnCreatedAlert() throws Exception {
        when(alertService.addAlert(any(Alert.class))).thenReturn(sampleAlert);

        mockMvc.perform(post("/alert/add-alert")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleAlert)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Patient fall detected"))
                .andExpect(jsonPath("$.typeAlerte").value("FALL_DETECTION"));
    }

    @Test
    void getAlert_ShouldReturnAlertById() throws Exception {
        when(alertService.retrieveAlert(1L)).thenReturn(sampleAlert);

        mockMvc.perform(get("/alert/retrieve-alert/{alert-id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alertId").value(1L))
                .andExpect(jsonPath("$.severite").value("HAUTE"));
    }

    @Test
    void updateAlert_ShouldReturnUpdatedAlert() throws Exception {
        Alert updatedAlert = new Alert();
        updatedAlert.setAlertId(1L);
        updatedAlert.setStatut(StatutAlerte.EN_COURS);
        
        when(alertService.updateAlert(eq(1L), any(Alert.class))).thenReturn(updatedAlert);

        mockMvc.perform(put("/alert/update-alert/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedAlert)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("EN_COURS"));
    }

    @Test
    void takeCharge_ShouldReturnAlertWithEnCoursStatus() throws Exception {
        Alert inProgressAlert = new Alert();
        inProgressAlert.setAlertId(1L);
        inProgressAlert.setStatut(StatutAlerte.EN_COURS);
        
        when(alertService.updateStatus(1L, StatutAlerte.EN_COURS)).thenReturn(inProgressAlert);

        mockMvc.perform(put("/alert/take-charge/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("EN_COURS"));
    }

    @Test
    void resolveAlert_ShouldReturnAlertWithResolvedStatus() throws Exception {
        Alert resolvedAlert = new Alert();
        resolvedAlert.setAlertId(1L);
        resolvedAlert.setStatut(StatutAlerte.RESOLUE);
        
        when(alertService.resolveAlert(1L)).thenReturn(resolvedAlert);

        mockMvc.perform(put("/alert/resolve/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("RESOLUE"));
    }

    @Test
    void ignoreAlert_ShouldReturnAlertWithIgnoredStatus() throws Exception {
        Alert ignoredAlert = new Alert();
        ignoredAlert.setAlertId(1L);
        ignoredAlert.setStatut(StatutAlerte.IGNOREE);
        
        when(alertService.ignoreAlert(1L)).thenReturn(ignoredAlert);

        mockMvc.perform(put("/alert/ignore/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("IGNOREE"));
    }

    @Test
    void removeAlert_ShouldReturnOk() throws Exception {
        doNothing().when(alertService).removeAlert(1L);

        mockMvc.perform(delete("/alert/remove-alert/{alert-id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void predictStability_ShouldReturnPredictionData() throws Exception {
        List<Alert> history = Arrays.asList(sampleAlert);
        when(alertRepository.findTop10ByPatientIdOrderByDateCreationDesc(100L)).thenReturn(history);
        when(predictiveService.calculateStabilitySlope(history)).thenReturn(-0.5);
        when(predictiveService.interpretTrend(-0.5)).thenReturn("Declining stability");

        mockMvc.perform(get("/alert/predict/patient/{id}", 100L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientId").value(100))
                .andExpect(jsonPath("$.stabilitySlope").value(-0.5))
                .andExpect(jsonPath("$.analysis").value("Declining stability"))
                .andExpect(jsonPath("$.sampleSize").value(1));
    }
}
