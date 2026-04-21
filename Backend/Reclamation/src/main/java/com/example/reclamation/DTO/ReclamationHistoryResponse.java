package com.example.reclamation.DTO;

import com.example.reclamation.Entity.ReclamationHistoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReclamationHistoryResponse {
    private Long historyId;
    private Long reclamationId;
    private ReclamationHistoryType eventType;
    private String description;
    private Long actorUserId;
    private LocalDateTime createdAt;
}
