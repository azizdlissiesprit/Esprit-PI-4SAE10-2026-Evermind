package com.example.reclamation.Service;

import com.example.reclamation.DTO.AttachmentResponse;
import com.example.reclamation.Entity.AttachmentType;
import com.example.reclamation.Entity.Reclamation;
import com.example.reclamation.Entity.ReclamationAttachment;
import com.example.reclamation.Entity.ReclamationCategory;
import com.example.reclamation.Entity.ReclamationPriority;
import com.example.reclamation.Entity.ReclamationStatus;
import com.example.reclamation.Exception.AttachmentNotFoundException;
import com.example.reclamation.Exception.BadRequestException;
import com.example.reclamation.Repository.ReclamationAttachmentRepository;
import com.example.reclamation.Repository.ReclamationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReclamationAttachmentServiceImplTest {

    @Mock
    private ReclamationAttachmentRepository attachmentRepository;

    @Mock
    private ReclamationRepository reclamationRepository;

    @Mock
    private IReclamationHistoryService historyService;

    @Mock
    private IReclamationNotificationService notificationService;

    @InjectMocks
    private ReclamationAttachmentServiceImpl attachmentService;

    @TempDir
    Path tempDir;

    private Reclamation reclamation;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(attachmentService, "uploadDirectory", tempDir.toString());
        reclamation = Reclamation.builder()
                .reclamationId(10L)
                .userId(42L)
                .subject("Subject")
                .description("Description")
                .priority(ReclamationPriority.HAUTE)
                .category(ReclamationCategory.SERVICE)
                .status(ReclamationStatus.EN_ATTENTE)
                .build();
    }

    @Test
    void uploadAttachmentStoresFileAndMetadata() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "proof.png",
                "image/png",
                "binary-content".getBytes()
        );

        when(reclamationRepository.findById(10L)).thenReturn(Optional.of(reclamation));
        when(attachmentRepository.save(any(ReclamationAttachment.class))).thenAnswer(invocation -> {
            ReclamationAttachment attachment = invocation.getArgument(0);
            attachment.setAttachmentId(1L);
            return attachment;
        });

        AttachmentResponse response = attachmentService.uploadAttachment(10L, file, 42L);

        assertThat(response.getAttachmentId()).isEqualTo(1L);
        assertThat(response.getOriginalFileName()).isEqualTo("proof.png");
        assertThat(response.getAttachmentType()).isEqualTo(AttachmentType.IMAGE);
        try (var files = Files.list(tempDir)) {
            assertThat(files.count()).isEqualTo(1);
        }
    }

    @Test
    void deleteAttachmentRemovesFileAndMetadata() throws Exception {
        Path storedFile = tempDir.resolve("stored-proof.png");
        Files.writeString(storedFile, "content");

        ReclamationAttachment attachment = ReclamationAttachment.builder()
                .attachmentId(5L)
                .reclamation(reclamation)
                .originalFileName("proof.png")
                .storedFileName("stored-proof.png")
                .contentType("image/png")
                .attachmentType(AttachmentType.IMAGE)
                .size(7L)
                .uploadedBy(42L)
                .build();

        when(attachmentRepository.findById(5L)).thenReturn(Optional.of(attachment));

        attachmentService.deleteAttachment(5L);

        assertThat(Files.exists(storedFile)).isFalse();
        verify(attachmentRepository).delete(attachment);
    }

    @Test
    void getAttachmentThrowsWhenMissing() {
        when(attachmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> attachmentService.getAttachment(99L))
                .isInstanceOf(AttachmentNotFoundException.class);
    }

    @Test
    void uploadAttachmentAcceptsAudioFilesForVoiceReclamation() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "voice-note.webm",
                "audio/webm",
                "audio-content".getBytes()
        );

        when(reclamationRepository.findById(10L)).thenReturn(Optional.of(reclamation));
        when(attachmentRepository.save(any(ReclamationAttachment.class))).thenAnswer(invocation -> {
            ReclamationAttachment attachment = invocation.getArgument(0);
            attachment.setAttachmentId(2L);
            return attachment;
        });

        AttachmentResponse response = attachmentService.uploadAttachment(10L, file, 42L);

        assertThat(response.getAttachmentType()).isEqualTo(AttachmentType.AUDIO);
    }

    @Test
    void uploadAttachmentRejectsUnsupportedTypes() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "script.exe",
                "application/octet-stream",
                "content".getBytes()
        );

        when(reclamationRepository.findById(10L)).thenReturn(Optional.of(reclamation));

        assertThatThrownBy(() -> attachmentService.uploadAttachment(10L, file, 42L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Unsupported file type");
    }
}
