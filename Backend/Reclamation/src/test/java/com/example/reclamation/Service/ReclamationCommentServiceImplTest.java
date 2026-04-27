package com.example.reclamation.Service;

import com.example.reclamation.DTO.CommentResponse;
import com.example.reclamation.DTO.CreateCommentRequest;
import com.example.reclamation.Entity.NotificationType;
import com.example.reclamation.Entity.Reclamation;
import com.example.reclamation.Entity.ReclamationCategory;
import com.example.reclamation.Entity.ReclamationComment;
import com.example.reclamation.Entity.ReclamationHistoryType;
import com.example.reclamation.Entity.ReclamationPriority;
import com.example.reclamation.Entity.ReclamationStatus;
import com.example.reclamation.Exception.BadRequestException;
import com.example.reclamation.Repository.ReclamationCommentRepository;
import com.example.reclamation.Repository.ReclamationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReclamationCommentServiceImplTest {

    @Mock
    private ReclamationCommentRepository commentRepository;

    @Mock
    private ReclamationRepository reclamationRepository;

    @Mock
    private IReclamationHistoryService historyService;

    @Mock
    private IReclamationNotificationService notificationService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ReclamationCommentServiceImpl commentService;

    private Reclamation reclamation;

    @BeforeEach
    void setUp() {
        reclamation = Reclamation.builder()
                .reclamationId(15L)
                .userId(42L)
                .subject("Subject")
                .description("Description")
                .priority(ReclamationPriority.HAUTE)
                .category(ReclamationCategory.SERVICE)
                .status(ReclamationStatus.EN_ATTENTE)
                .build();
    }

    @Test
    void addCommentByUserCreatesHistoryNotificationAndBroadcast() {
        when(reclamationRepository.findById(15L)).thenReturn(Optional.of(reclamation));
        when(commentRepository.save(any(ReclamationComment.class))).thenAnswer(invocation -> {
            ReclamationComment comment = invocation.getArgument(0);
            comment.setCommentId(1L);
            return comment;
        });

        CommentResponse response = commentService.addComment(15L, CreateCommentRequest.builder()
                .senderId(42L)
                .message("Can you check this please?")
                .build(), null);

        assertThat(response.getSenderRole()).isEqualTo("USER");
        verify(historyService).recordEvent(eq(reclamation), eq(ReclamationHistoryType.COMMENT_ADDED), eq("Comment added to discussion"), eq(42L));
        verify(notificationService).notifyAdmins(eq(reclamation), eq(NotificationType.NEW_COMMENT), eq("New message on reclamation"), eq("A user sent a new message on reclamation: Subject"));
        verify(messagingTemplate).convertAndSend("/topic/reclamations/15/comments", response);
    }

    @Test
    void addReplyByAdminNotifiesOwner() {
        ReclamationComment parent = ReclamationComment.builder()
                .commentId(9L)
                .reclamation(reclamation)
                .senderId(42L)
                .senderRole("USER")
                .message("Original")
                .build();

        when(reclamationRepository.findById(15L)).thenReturn(Optional.of(reclamation));
        when(commentRepository.findById(9L)).thenReturn(Optional.of(parent));
        when(commentRepository.save(any(ReclamationComment.class))).thenAnswer(invocation -> {
            ReclamationComment comment = invocation.getArgument(0);
            comment.setCommentId(2L);
            return comment;
        });

        CommentResponse response = commentService.addComment(15L, CreateCommentRequest.builder()
                .senderId(99L)
                .parentCommentId(9L)
                .message("We are working on it")
                .build(), null);

        assertThat(response.getSenderRole()).isEqualTo("ADMIN");
        assertThat(response.getParentCommentId()).isEqualTo(9L);
        verify(notificationService).notifyUser(eq(42L), eq(reclamation), eq(NotificationType.NEW_COMMENT), eq("New reply on your reclamation"), eq("An admin sent a new message on your reclamation"));
    }

    @Test
    void addCommentFailsWhenSenderIsMissing() {
        when(reclamationRepository.findById(15L)).thenReturn(Optional.of(reclamation));

        assertThatThrownBy(() -> commentService.addComment(15L, CreateCommentRequest.builder()
                .message("Hello")
                .build(), null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("senderId");
    }
}
