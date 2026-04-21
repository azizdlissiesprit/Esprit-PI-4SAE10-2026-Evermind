package com.agenda.controller;

import com.agenda.dto.RendezVousDTO;
import com.agenda.entity.RendezVous;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RendezVousControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void crud_flow() throws Exception {
        RendezVousDTO dto = new RendezVousDTO();
        dto.setPatientNom("Doe");
        dto.setPatientPrenom("Jane");
        dto.setType(RendezVous.TypeRDV.CONSULTATION);
        dto.setStatut(RendezVous.StatutRDV.CONFIRME);
        dto.setDateHeure(LocalDateTime.now().plusDays(1));
        dto.setDureeMinutes(30);
        dto.setNotes("Initial notes");

        String createResponse = mockMvc.perform(post("/api/rendezvous")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.patientNom").value("Doe"))
                .andReturn().getResponse().getContentAsString();

        RendezVousDTO created = objectMapper.readValue(createResponse, RendezVousDTO.class);
        Long id = created.getId();

        mockMvc.perform(get("/api/rendezvous/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientPrenom").value("Jane"));

        mockMvc.perform(get("/api/rendezvous"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        created.setNotes("Updated notes");
        created.setStatut(RendezVous.StatutRDV.EN_ATTENTE);
        mockMvc.perform(put("/api/rendezvous/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(created)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes").value("Updated notes"))
                .andExpect(jsonPath("$.statut").value("EN_ATTENTE"));

        mockMvc.perform(delete("/api/rendezvous/" + id))
                .andExpect(status().isNoContent());
    }
}
