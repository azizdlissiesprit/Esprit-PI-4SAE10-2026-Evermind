package tn.esprit.cognitiveassessment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.cognitiveassessment.entity.AssessmentScoreEmbeddable;
import tn.esprit.cognitiveassessment.entity.AssessmentType;
import tn.esprit.cognitiveassessment.entity.CognitiveAssessment;
import tn.esprit.cognitiveassessment.entity.TrendType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CognitiveAssessmentControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void crud_flow() throws Exception {
        AssessmentScoreEmbeddable scores = new AssessmentScoreEmbeddable(5, 6, 7, 5);
        CognitiveAssessment a = CognitiveAssessment.builder()
                .patientId("P-2024-8921")
                .date("23/02/2025")
                .type(AssessmentType.complete)
                .evaluator("Dr. Test")
                .mmseScore(22)
                .moocaScore(19)
                .trend(TrendType.stable)
                .trendPoints(0)
                .scores(scores)
                .observations("Test")
                .build();

        String json = objectMapper.writeValueAsString(a);

        // CREATE
        String createResponse = mockMvc.perform(post("/api/cognitive-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.patientId").value("P-2024-8921"))
                .andExpect(jsonPath("$.mmseScore").value(22))
                .andReturn().getResponse().getContentAsString();

        CognitiveAssessment created = objectMapper.readValue(createResponse, CognitiveAssessment.class);
        Long id = created.getId();

        // GET BY ID
        mockMvc.perform(get("/api/cognitive-assessments/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.evaluator").value("Dr. Test"));

        // GET ALL
        mockMvc.perform(get("/api/cognitive-assessments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // GET BY PATIENT
        mockMvc.perform(get("/api/cognitive-assessments/patient/P-2024-8921"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // UPDATE
        created.setObservations("Updated observations");
        created.setMmseScore(24);
        mockMvc.perform(put("/api/cognitive-assessments/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(created)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.observations").value("Updated observations"))
                .andExpect(jsonPath("$.mmseScore").value(24));

        // DELETE
        mockMvc.perform(delete("/api/cognitive-assessments/" + id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/cognitive-assessments/" + id))
                .andExpect(status().isNotFound());
    }
}
