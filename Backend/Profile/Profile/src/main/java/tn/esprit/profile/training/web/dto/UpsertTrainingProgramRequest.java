package tn.esprit.profile.training.web.dto;

public record UpsertTrainingProgramRequest(
        String title,
        String description,
        String theme
) {}

