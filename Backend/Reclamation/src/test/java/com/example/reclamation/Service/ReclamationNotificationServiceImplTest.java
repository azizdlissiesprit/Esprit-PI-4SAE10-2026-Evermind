package com.example.reclamation.Service;

import com.example.reclamation.DTO.NotificationResponse;
import com.example.reclamation.Entity.NotificationAudience;
import com.example.reclamation.Entity.NotificationType;
import com.example.reclamation.Entity.Reclamation;
import com.example.reclamation.Entity.ReclamationCategory;
import com.example.reclamation.Entity.ReclamationNotification;
import com.example.reclamation.Entity.ReclamationPriority;
import com.example.reclamation.Entity.ReclamationStatus;
import com.example.reclamation.Exception.NotificationNotFoundException;
import com.example.reclamation.Repository.ReclamationNotificationRepository;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReclamationNotificationServiceImplTest {

    @Mock
    private ReclamationNotificationRepository notificationRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ReclamationNotificationServiceImpl notificationService;

    private Reclamation reclamation;

    @BeforeEach
    void setUp() {
        reclamation = Reclamation.builder()
                .reclamationId(12L)
                .userId(42L)
                .subject("Subject")
                .description("Description")
                .priority(ReclamationPriority.HAUTE)
                .category(ReclamationCategory.SERVICE)
                .status(ReclamationStatus.EN_ATTENTE)
                .build();
    }

    @Test
    void notifyUserPersistsAndPushesNotification() {
        when(notificationRepository.save(any(ReclamationNotification.class))).thenAnswer(invocation -> {
            ReclamationNotification notification = invocation.getArgument(0);
            notification.setNotificationId(1L);
            return notification;
        });

        NotificationResponse response = notificationService.notifyUser(
                42L,
                reclamation,
                NotificationType.STATUS_CHANGED,
                "Title",
                "Message"
        );

        assertThat(response.getAudience()).isEqualTo(NotificationAudience.USER);
        assertThat(response.getRecipientUserId()).isEqualTo(42L);
        verify(messagingTemplate).convertAndSend("/topic/notifications/users/42", response);
    }

    @Test
    void notifyAdminsPersistsAndPushesNotification() {
        when(notificationRepository.save(any(ReclamationNotification.class))).thenAnswer(invocation -> {
            ReclamationNotification notification = invocation.getArgument(0);
            notification.setNotificationId(2L);
            return notification;
        });

        NotificationResponse response = notificationService.notifyAdmins(
                reclamation,
                NotificationType.RECLAMATION_CREATED,
                "Title",
                "Message"
        );

        assertThat(response.getAudience()).isEqualTo(NotificationAudience.ADMIN);
        verify(messagingTemplate).convertAndSend("/topic/notifications/admin", response);
    }

    @Test
    void markAsReadThrowsWhenMissing() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(99L))
                .isInstanceOf(NotificationNotFoundException.class);
    }
}
