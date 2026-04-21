package com.example.reclamation.Service;

import com.example.reclamation.DTO.CreateReclamationRequest;
import com.example.reclamation.DTO.ReclamationResponse;
import com.example.reclamation.DTO.UpdateReclamationRequest;
import com.example.reclamation.Entity.NotificationType;
import com.example.reclamation.Entity.Reclamation;
import com.example.reclamation.Entity.ReclamationHistoryType;
import com.example.reclamation.Entity.ReclamationStatus;
import com.example.reclamation.Exception.BadRequestException;
import com.example.reclamation.Exception.ReclamationNotFoundException;
import com.example.reclamation.Repository.ReclamationCommentRepository;
import com.example.reclamation.Repository.ReclamationHistoryRepository;
import com.example.reclamation.Repository.ReclamationNotificationRepository;
import com.example.reclamation.Repository.ReclamationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReclamationServiceImpl implements IReclamationService {

    private final ReclamationRepository reclamationRepository;
    private final IReclamationHistoryService historyService;
    private final IReclamationNotificationService notificationService;
    private final IReclamationAttachmentService attachmentService;
    private final ReclamationCommentRepository commentRepository;
    private final ReclamationNotificationRepository notificationRepository;
    private final ReclamationHistoryRepository historyRepository;

    @Override
    public ReclamationResponse createReclamation(CreateReclamationRequest request, Long authenticatedUserId) {
        Long ownerId = authenticatedUserId != null ? authenticatedUserId : request.getUserId();
        if (ownerId == null) {
            throw new BadRequestException("A userId is required to create a reclamation");
        }

        Reclamation reclamation = Reclamation.builder()
                .userId(ownerId)
                .subject(request.getSubject().trim())
                .description(request.getDescription().trim())
                .priority(request.getPriority())
                .category(request.getCategory())
                .status(ReclamationStatus.EN_ATTENTE)
                .build();

        Reclamation savedReclamation = reclamationRepository.save(reclamation);
        historyService.recordEvent(
                savedReclamation,
                ReclamationHistoryType.RECLAMATION_CREATED,
                "Reclamation created",
                ownerId
        );
        notificationService.notifyAdmins(
                savedReclamation,
                NotificationType.RECLAMATION_CREATED,
                "New reclamation created",
                "A new reclamation was created: " + savedReclamation.getSubject()
        );
        return mapToResponse(savedReclamation);
    }

    @Override
    public ReclamationResponse updateReclamation(Long id, UpdateReclamationRequest request, Long actorUserId) {
        Reclamation reclamation = findExisting(id);

        if (request.getStatus() != null) {
            ReclamationStatus previousStatus = reclamation.getStatus();
            reclamation.setStatus(request.getStatus());

            if (request.getStatus() == ReclamationStatus.RESOLUE
                    || request.getStatus() == ReclamationStatus.REJETEE) {
                reclamation.setResolvedAt(LocalDateTime.now());
            } else {
                reclamation.setResolvedAt(null);
            }

            if (previousStatus != request.getStatus()) {
                historyService.recordEvent(
                        reclamation,
                        ReclamationHistoryType.STATUS_CHANGED,
                        "Status changed from " + previousStatus + " to " + request.getStatus(),
                        actorUserId
                );
                if (!reclamation.getUserId().equals(actorUserId)) {
                    notificationService.notifyUser(
                            reclamation.getUserId(),
                            reclamation,
                            NotificationType.STATUS_CHANGED,
                            "Reclamation status updated",
                            "Your reclamation status changed to " + request.getStatus()
                    );
                }
            }
        }

        if (request.getResponse() != null) {
            reclamation.setResponse(request.getResponse().trim());
            historyService.recordEvent(
                    reclamation,
                    ReclamationHistoryType.RESPONSE_ADDED,
                    "Response added or updated",
                    actorUserId
            );
            if (!reclamation.getUserId().equals(actorUserId)) {
                notificationService.notifyUser(
                        reclamation.getUserId(),
                        reclamation,
                        NotificationType.RESPONSE_ADDED,
                        "New response on your reclamation",
                        "An admin added a response to your reclamation"
                );
            }
        }

        if (request.getRespondedBy() != null) {
            reclamation.setRespondedBy(request.getRespondedBy());
        }

        return mapToResponse(reclamationRepository.save(reclamation));
    }

    @Override
    public ReclamationResponse getReclamationById(Long id) {
        return mapToResponse(findExisting(id));
    }

    @Override
    public List<ReclamationResponse> getAllReclamations() {
        return reclamationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ReclamationResponse> getReclamationsByUserId(Long userId) {
        return reclamationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<ReclamationResponse> getReclamationsByStatus(ReclamationStatus status) {
        return reclamationRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteReclamation(Long id, Long actorUserId) {
        Reclamation reclamation = findExisting(id);

        attachmentService.deleteAllAttachmentsByReclamation(id);
        commentRepository.deleteByReclamationReclamationId(id);
        notificationRepository.deleteByReclamationReclamationId(id);
        historyRepository.deleteByReclamationReclamationId(id);
        reclamationRepository.delete(reclamation);
    }

    @Override
    public long countByStatus(ReclamationStatus status) {
        return reclamationRepository.countByStatus(status);
    }

    private Reclamation findExisting(Long id) {
        return reclamationRepository.findById(id)
                .orElseThrow(() -> new ReclamationNotFoundException(id));
    }

    private ReclamationResponse mapToResponse(Reclamation reclamation) {
        return ReclamationResponse.builder()
                .reclamationId(reclamation.getReclamationId())
                .userId(reclamation.getUserId())
                .subject(reclamation.getSubject())
                .description(reclamation.getDescription())
                .status(reclamation.getStatus())
                .priority(reclamation.getPriority())
                .category(reclamation.getCategory())
                .createdAt(reclamation.getCreatedAt())
                .updatedAt(reclamation.getUpdatedAt())
                .resolvedAt(reclamation.getResolvedAt())
                .response(reclamation.getResponse())
                .respondedBy(reclamation.getRespondedBy())
                .build();
    }
}
