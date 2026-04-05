package com.example.reclamation.DTO;

import com.example.reclamation.Entity.ReclamationCategory;
import com.example.reclamation.Entity.ReclamationPriority;
import com.example.reclamation.Entity.ReclamationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReclamationResponse {
    private Long reclamationId;
    private Long userId;
    private String subject;
    private String description;
    private ReclamationStatus status;
    private ReclamationPriority priority;
    private ReclamationCategory category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private String response;
    private Long respondedBy;
}
