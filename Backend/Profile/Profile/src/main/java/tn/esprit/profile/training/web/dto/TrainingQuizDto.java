package tn.esprit.profile.training.web.dto;

public record TrainingQuizDto(
        Long id,
        Long moduleId,
        String title,
        Integer passingScore
) {}

