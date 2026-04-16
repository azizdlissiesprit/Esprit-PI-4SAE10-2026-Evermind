package tn.esprit.profile.training.web.dto;

public record TrainingResourceDto(
        Long id,
        Long moduleId,
        String url,
        String fileType,
        Integer size
) {}

