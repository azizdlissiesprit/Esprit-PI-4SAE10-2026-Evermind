package tn.esprit.patient.Controller;

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
import tn.esprit.patient.Entity.Patient;
import tn.esprit.patient.Service.IPatientService;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PatientControllerTest {

    private MockMvc mockMvc;

    @Mock
    private IPatientService patientService;

    @InjectMocks
    private PatientController patientController;

    private ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    private Patient samplePatient;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(patientController).build();

        samplePatient = Patient.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .dateOfBirth(LocalDate.of(1950, 5, 20))
                .gender("M")
                .wearableDeviceId("DEV-12345")
                .responsable(10L)
                .build();
    }

    @Test
    void create_ShouldReturnCreatedPatient() throws Exception {
        when(patientService.create(any(Patient.class))).thenReturn(samplePatient);

        mockMvc.perform(post("/patient")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(samplePatient)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    void update_ShouldReturnUpdatedPatient() throws Exception {
        when(patientService.update(eq(1L), any(Patient.class))).thenReturn(samplePatient);

        mockMvc.perform(put("/patient/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(samplePatient)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    void getById_ShouldReturnPatient() throws Exception {
        when(patientService.getById(1L)).thenReturn(samplePatient);

        mockMvc.perform(get("/patient/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.wearableDeviceId").value("DEV-12345"));
    }

    @Test
    void getAll_ShouldReturnList() throws Exception {
        List<Patient> list = Arrays.asList(samplePatient);
        when(patientService.getAll()).thenReturn(list);

        mockMvc.perform(get("/patient")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void delete_ShouldReturnOk() throws Exception {
        doNothing().when(patientService).delete(1L);

        mockMvc.perform(delete("/patient/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void getPatientsByResponsable_ShouldReturnList() throws Exception {
        List<Patient> list = Arrays.asList(samplePatient);
        when(patientService.getPatientsByResponsable(10L)).thenReturn(list);

        mockMvc.perform(get("/patient/responsable/{responsableId}", 10L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].responsable").value(10L));
    }
}
