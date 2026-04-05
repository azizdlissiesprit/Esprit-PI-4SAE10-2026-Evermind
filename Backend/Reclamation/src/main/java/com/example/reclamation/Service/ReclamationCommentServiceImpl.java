package com.example.reclamation.Service;

import com.example.reclamation.DTO.CommentResponse;
import com.example.reclamation.DTO.CreateCommentRequest;
import com.example.reclamation.Entity.NotificationType;
import com.example.reclamation.Entity.Reclamation;
import com.example.reclamation.Entity.ReclamationComment;
import com.example.reclamation.Entity.ReclamationHistoryType;
import com.example.reclamation.Exception.BadRequestException;
import com.example.reclamation.Exception.CommentNotFoundException;
import com.example.reclamation.Exception.ReclamationNotFoundException;
import com.example.reclamation.Repository.ReclamationCommentRepository;
import com.example.reclamation.Repository.ReclamationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReclamationCommentServiceImpl implements IReclamationCommentService {

    private final ReclamationCommentRepository commentRepository;
    private final ReclamationRepository reclamationRepository;
    private final IReclamationHistoryService historyService;
    private final IReclamationNotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public CommentResponse addComment(Long reclamationId, CreateCommentRequest request, Long authenticatedUserId) {
        Reclamation reclamation = reclamationRepository.findById(reclamationId)
                .orElseThrow(() -> new ReclamationNotFoundException(reclamationId));

        Long senderId = authenticatedUserId != null ? authenticatedUserId : request.getSenderId();
        if (senderId == null) {
            throw new BadRequestException("A senderId is required");
        }

        ReclamationComment parentComment = null;
        if (request.getParentCommentId() != null) {
            parentComment = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new CommentNotFoundException(request.getParentCommentId()));
            if (!parentComment.getReclamation().getReclamationId().equals(reclamationId)) {
                throw new BadRequestException("Parent comment does not belong to this reclamation");
            }
        }

        String senderRole = senderId.equals(reclamation.getUserId()) ? "USER" : "ADMIN";
        ReclamationComment comment = ReclamationComment.builder()
                .reclamation(reclamation)
                .parentComment(parentComment)
                .senderId(senderId)
                .senderRole(senderRole)
                .message(request.getMessage().trim())
                .build();

        ReclamationComment savedComment = commentRepository.save(comment);
        CommentResponse response = mapToResponse(savedComment);

        historyService.recordEvent(
                reclamation,
                ReclamationHistoryType.COMMENT_ADDED,
                parentComment != null ? "Reply added to discussion" : "Comment added to discussion",
                senderId
        );

        if ("USER".equals(senderRole)) {
            notificationService.notifyAdmins(
                    reclamation,
                    NotificationType.NEW_COMMENT,
                    "New message on reclamation",
                    "A user sent a new message on reclamation: " + reclamation.getSubject()
            );
        } else {
            notificationService.notifyUser(
                    reclamation.getUserId(),
                    reclamation,
                    NotificationType.NEW_COMMENT,
                    "New reply on your reclamation",
                    "An admin sent a new message on your reclamation"
            );
        }

        messagingTemplate.convertAndSend("/topic/reclamations/" + reclamationId + "/comments", response);
        return response;
    }

    @Override
    public List<CommentResponse> getCommentsByReclamation(Long reclamationId) {
        if (!reclamationRepository.existsById(reclamationId)) {
            throw new ReclamationNotFoundException(reclamationId);
        }

        return commentRepository.findByReclamationReclamationIdOrderByCreatedAtAsc(reclamationId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private CommentResponse mapToResponse(ReclamationComment comment) {
        return CommentResponse.builder()
                .commentId(comment.getCommentId())
                .reclamationId(comment.getReclamation().getReclamationId())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getCommentId() : null)
                .senderId(comment.getSenderId())
                .senderRole(comment.getSenderRole())
                .message(comment.getMessage())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
