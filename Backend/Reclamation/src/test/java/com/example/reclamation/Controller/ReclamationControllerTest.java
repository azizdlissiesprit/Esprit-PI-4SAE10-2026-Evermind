package com.example.reclamation.Controller;

import com.example.reclamation.Config.JwtUtils;
import com.example.reclamation.DTO.CreateReclamationRequest;
import com.example.reclamation.DTO.ReclamationResponse;
import com.example.reclamation.Entity.ReclamationCategory;
import com.example.reclamation.Entity.ReclamationPriority;
import com.example.reclamation.Entity.ReclamationStatus;
import com.example.reclamation.Exception.GlobalExceptionHandler;
import com.example.reclamation.Service.IReclamationAttachmentService;
import com.example.reclamation.Service.IReclamationCommentService;
import com.example.reclamation.Service.IReclamationHistoryService;
import com.example.reclamation.Service.IReclamationNotificationService;
import com.example.reclamation.Service.IReclamationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReclamationController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class ReclamationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IReclamationService reclamationService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private IReclamationAttachmentService attachmentService;

    @MockBean
    private IReclamationCommentService commentService;

    @MockBean
    private IReclamationHistoryService historyService;

    @MockBean
    private IReclamationNotificationService notificationService;

    @Test
    void createReclamationReturnsCreated() throws Exception {
        CreateReclamationRequest request = CreateReclamationRequest.builder()
                .userId(42L)
                .subject("Billing issue")
                .description("Wrong amount")
                .priority(ReclamationPriority.HAUTE)
                .category(ReclamationCategory.FACTURATION)
                .build();

        when(reclamationService.createReclamation(any(CreateReclamationRequest.class), eq(null)))
                .thenReturn(ReclamationResponse.builder()
                        .reclamationId(1L)
                        .userId(42L)
                        .subject("Billing issue")
                        .status(ReclamationStatus.EN_ATTENTE)
                        .build());

        mockMvc.perform(post("/api/reclamations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reclamationId").value(1L));
    }

    @Test
    void createReclamationReturnsBadRequestWhenPayloadIsInvalid() throws Exception {
        CreateReclamationRequest request = CreateReclamationRequest.builder()
                .userId(42L)
                .subject("")
                .description("")
                .build();

        mockMvc.perform(post("/api/reclamations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void getAllReclamationsReturnsData() throws Exception {
        when(reclamationService.getAllReclamations()).thenReturn(List.of(
                ReclamationResponse.builder()
                        .reclamationId(1L)
                        .userId(42L)
                        .subject("Billing issue")
                        .status(ReclamationStatus.EN_ATTENTE)
                        .build()
        ));

        mockMvc.perform(get("/api/reclamations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subject").value("Billing issue"));
    }
}
