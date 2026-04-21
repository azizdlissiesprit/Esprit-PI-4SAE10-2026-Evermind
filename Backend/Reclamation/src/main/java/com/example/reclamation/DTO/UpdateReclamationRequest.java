package com.example.reclamation.DTO;

import com.example.reclamation.Entity.ReclamationStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateReclamationRequest {
    private ReclamationStatus status;

    @Size(max = 5000, message = "Response must not exceed 5000 characters")
    private String response;

    private Long respondedBy;
}
