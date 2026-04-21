package com.example.reclamation.DTO;

import com.example.reclamation.Entity.ReclamationCategory;
import com.example.reclamation.Entity.ReclamationPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReclamationRequest {
    private Long userId;

    @NotBlank(message = "Subject is required")
    @Size(max = 200, message = "Subject must not exceed 200 characters")
    private String subject;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private ReclamationPriority priority;

    @NotNull(message = "Category is required")
    private ReclamationCategory category;
}
