package tn.esprit.formation.DTO;

import lombok.Data;
import java.util.List;

@Data
public class GenerateQuestionsRequest {
    private String topic;
    private int numberOfQuestions;
    private List<String> questionTypes; // e.g. ["QCU", "QCM", "TRUE_FALSE"]
}
