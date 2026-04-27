package com.example.reclamation.Service;

import com.example.reclamation.DTO.ReclamationHistoryResponse;
import com.example.reclamation.Entity.Reclamation;
import com.example.reclamation.Entity.ReclamationHistoryType;

import java.util.List;

public interface IReclamationHistoryService {
    void recordEvent(Reclamation reclamation, ReclamationHistoryType eventType, String description, Long actorUserId);

    List<ReclamationHistoryResponse> getHistoryByReclamation(Long reclamationId);
}
