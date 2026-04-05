package com.example.reclamation.DTO;

import com.example.reclamation.Entity.AttachmentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentResponse {
    private Long attachmentId;
    private Long reclamationId;
    private String originalFileName;
    private String contentType;
    private AttachmentType attachmentType;
    private Long size;
    private Long uploadedBy;
    private LocalDateTime uploadedAt;
    private String downloadUrl;
}
