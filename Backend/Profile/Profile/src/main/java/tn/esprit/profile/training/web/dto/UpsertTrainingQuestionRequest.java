package tn.esprit.profile.training.web.dto;

import java.util.List;

public record UpsertTrainingQuestionRequest(
        Long quizId,
        String text,
        List<String> choices,
        Integer correctChoiceIndex
) {}

