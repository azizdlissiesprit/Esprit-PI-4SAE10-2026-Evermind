package tn.esprit.profile.training.web.dto;

public record UpsertTrainingQuizRequest(
        Long moduleId,
        String title,
        Integer passingScore
) {}

