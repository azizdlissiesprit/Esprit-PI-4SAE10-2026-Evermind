package tn.esprit.chatbot.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotResponse {
    private Long interactionId;
    private String question;
    private String answer;
    private String generatedSql;
    private String databaseQueried;
    private LocalDateTime timestamp;
    private boolean success;
    private String errorMessage;
}
