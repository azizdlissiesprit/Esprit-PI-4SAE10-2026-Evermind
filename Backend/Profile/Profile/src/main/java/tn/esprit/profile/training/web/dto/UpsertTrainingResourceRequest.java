package tn.esprit.profile.training.web.dto;

public record UpsertTrainingResourceRequest(
        Long moduleId,
        String url,
        String fileType,
        Integer size
) {}

