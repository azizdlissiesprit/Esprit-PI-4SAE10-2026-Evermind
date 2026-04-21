package com.example.reclamation.Service;

import com.example.reclamation.DTO.CreateReclamationRequest;
import com.example.reclamation.DTO.ReclamationResponse;
import com.example.reclamation.DTO.UpdateReclamationRequest;
import com.example.reclamation.Entity.Reclamation;
import com.example.reclamation.Entity.ReclamationCategory;
import com.example.reclamation.Entity.ReclamationPriority;
import com.example.reclamation.Entity.ReclamationStatus;
import com.example.reclamation.Exception.BadRequestException;
import com.example.reclamation.Exception.ReclamationNotFoundException;
import com.example.reclamation.Repository.ReclamationCommentRepository;
import com.example.reclamation.Repository.ReclamationHistoryRepository;
import com.example.reclamation.Repository.ReclamationNotificationRepository;
import com.example.reclamation.Repository.ReclamationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReclamationServiceImplTest {

    @Mock
    private ReclamationRepository reclamationRepository;

    @Mock
    private IReclamationHistoryService historyService;

    @Mock
    private IReclamationNotificationService notificationService;

    @Mock
    private IReclamationAttachmentService attachmentService;

    @Mock
    private ReclamationCommentRepository commentRepository;

    @Mock
    private ReclamationNotificationRepository notificationRepository;

    @Mock
    private ReclamationHistoryRepository historyRepository;

    @InjectMocks
    private ReclamationServiceImpl reclamationService;

    private CreateReclamationRequest createRequest;

    @BeforeEach
    void setUp() {
        createRequest = CreateReclamationRequest.builder()
                .userId(42L)
                .subject("Delivery issue")
                .description("The delivery was incomplete")
                .priority(ReclamationPriority.HAUTE)
                .category(ReclamationCategory.SERVICE)
                .build();
    }

    @Test
    void createReclamationUsesAuthenticatedUserIdWhenAvailable() {
        when(reclamationRepository.save(any(Reclamation.class))).thenAnswer(invocation -> {
            Reclamation reclamation = invocation.getArgument(0);
            reclamation.setReclamationId(1L);
            return reclamation;
        });

        ReclamationResponse response = reclamationService.createReclamation(createRequest, 100L);

        ArgumentCaptor<Reclamation> captor = ArgumentCaptor.forClass(Reclamation.class);
        verify(reclamationRepository).save(captor.capture());
        verify(historyService).recordEvent(any(Reclamation.class), eq(com.example.reclamation.Entity.ReclamationHistoryType.RECLAMATION_CREATED), eq("Reclamation created"), eq(100L));
        assertThat(captor.getValue().getUserId()).isEqualTo(100L);
        assertThat(response.getStatus()).isEqualTo(ReclamationStatus.EN_ATTENTE);
    }

    @Test
    void createReclamationFailsWhenNoUserIdIsAvailable() {
        createRequest.setUserId(null);

        assertThatThrownBy(() -> reclamationService.createReclamation(createRequest, null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("userId");
    }

    @Test
    void updateReclamationSetsResolvedAtWhenResolved() {
        Reclamation reclamation = Reclamation.builder()
                .reclamationId(5L)
                .userId(42L)
                .subject("Subject")
                .description("Description")
                .priority(ReclamationPriority.MOYENNE)
                .category(ReclamationCategory.TECHNIQUE)
                .status(ReclamationStatus.EN_COURS)
                .build();

        when(reclamationRepository.findById(5L)).thenReturn(Optional.of(reclamation));
        when(reclamationRepository.save(any(Reclamation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReclamationResponse response = reclamationService.updateReclamation(5L, UpdateReclamationRequest.builder()
                .status(ReclamationStatus.RESOLUE)
                .response("Solved")
                .respondedBy(7L)
                .build(), 7L);

        assertThat(response.getStatus()).isEqualTo(ReclamationStatus.RESOLUE);
        assertThat(response.getResolvedAt()).isNotNull();
        assertThat(response.getRespondedBy()).isEqualTo(7L);
        verify(historyService).recordEvent(any(Reclamation.class), eq(com.example.reclamation.Entity.ReclamationHistoryType.STATUS_CHANGED), eq("Status changed from EN_COURS to RESOLUE"), eq(7L));
        verify(historyService).recordEvent(any(Reclamation.class), eq(com.example.reclamation.Entity.ReclamationHistoryType.RESPONSE_ADDED), eq("Response added or updated"), eq(7L));
    }

    @Test
    void updateReclamationClearsResolvedAtWhenMovedBackToInProgress() {
        Reclamation reclamation = Reclamation.builder()
                .reclamationId(5L)
                .userId(42L)
                .subject("Subject")
                .description("Description")
                .priority(ReclamationPriority.MOYENNE)
                .category(ReclamationCategory.TECHNIQUE)
                .status(ReclamationStatus.RESOLUE)
                .resolvedAt(LocalDateTime.now())
                .build();

        when(reclamationRepository.findById(5L)).thenReturn(Optional.of(reclamation));
        when(reclamationRepository.save(any(Reclamation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReclamationResponse response = reclamationService.updateReclamation(5L, UpdateReclamationRequest.builder()
                .status(ReclamationStatus.EN_COURS)
                .build(), 7L);

        assertThat(response.getResolvedAt()).isNull();
    }

    @Test
    void getReclamationByIdThrowsWhenMissing() {
        when(reclamationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reclamationService.getReclamationById(99L))
                .isInstanceOf(ReclamationNotFoundException.class);
    }

    @Test
    void deleteReclamationRemovesRelatedDataBeforeDeletingParent() {
        Reclamation reclamation = Reclamation.builder()
                .reclamationId(8L)
                .userId(42L)
                .subject("Subject")
                .description("Description")
                .priority(ReclamationPriority.MOYENNE)
                .category(ReclamationCategory.TECHNIQUE)
                .status(ReclamationStatus.EN_ATTENTE)
                .build();

        when(reclamationRepository.findById(8L)).thenReturn(Optional.of(reclamation));

        reclamationService.deleteReclamation(8L, 42L);

        verify(attachmentService).deleteAllAttachmentsByReclamation(8L);
        verify(commentRepository).deleteByReclamationReclamationId(8L);
        verify(notificationRepository).deleteByReclamationReclamationId(8L);
        verify(historyRepository).deleteByReclamationReclamationId(8L);
        verify(reclamationRepository).delete(reclamation);
    }
}
