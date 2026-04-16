package tn.esprit.profile.training.web.dto;

import java.time.Instant;

public record TrainingProgramDto(
        Long id,
        String title,
        String description,
        String theme,
        Instant createdAt
) {}

