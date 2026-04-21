package com.example.reclamation.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private Long commentId;
    private Long reclamationId;
    private Long parentCommentId;
    private Long senderId;
    private String senderRole;
    private String message;
    private LocalDateTime createdAt;
}
