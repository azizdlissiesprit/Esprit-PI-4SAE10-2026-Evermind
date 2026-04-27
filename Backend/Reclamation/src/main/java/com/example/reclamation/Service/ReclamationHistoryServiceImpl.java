package com.example.reclamation.Service;

import com.example.reclamation.DTO.ReclamationHistoryResponse;
import com.example.reclamation.Entity.Reclamation;
import com.example.reclamation.Entity.ReclamationHistory;
import com.example.reclamation.Entity.ReclamationHistoryType;
import com.example.reclamation.Exception.ReclamationNotFoundException;
import com.example.reclamation.Repository.ReclamationHistoryRepository;
import com.example.reclamation.Repository.ReclamationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReclamationHistoryServiceImpl implements IReclamationHistoryService {

    private final ReclamationHistoryRepository historyRepository;
    private final ReclamationRepository reclamationRepository;

    @Override
    public void recordEvent(Reclamation reclamation, ReclamationHistoryType eventType, String description, Long actorUserId) {
        ReclamationHistory history = ReclamationHistory.builder()
                .reclamation(reclamation)
                .eventType(eventType)
                .description(description)
                .actorUserId(actorUserId)
                .build();
        historyRepository.save(history);
    }

    @Override
    public List<ReclamationHistoryResponse> getHistoryByReclamation(Long reclamationId) {
        if (!reclamationRepository.existsById(reclamationId)) {
            throw new ReclamationNotFoundException(reclamationId);
        }

        return historyRepository.findByReclamationReclamationIdOrderByCreatedAtDesc(reclamationId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ReclamationHistoryResponse mapToResponse(ReclamationHistory history) {
        return ReclamationHistoryResponse.builder()
                .historyId(history.getHistoryId())
                .reclamationId(history.getReclamation().getReclamationId())
                .eventType(history.getEventType())
                .description(history.getDescription())
                .actorUserId(history.getActorUserId())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
