package tn.esprit.profile.training.web.dto;

import tn.esprit.profile.training.entity.TrainingModuleType;

public record TrainingModuleDto(
        Long id,
        Long programId,
        String title,
        TrainingModuleType type,
        String content,
        Integer estimatedDuration
) {}

