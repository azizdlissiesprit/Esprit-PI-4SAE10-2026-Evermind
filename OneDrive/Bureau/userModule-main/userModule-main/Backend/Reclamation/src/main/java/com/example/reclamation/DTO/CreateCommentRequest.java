package com.example.reclamation.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCommentRequest {
    private Long senderId;
    private Long parentCommentId;

    @NotBlank(message = "Message is required")
    private String message;
}
