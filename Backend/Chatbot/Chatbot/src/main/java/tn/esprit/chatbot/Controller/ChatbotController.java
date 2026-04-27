package tn.esprit.chatbot.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.chatbot.DTO.ChatbotRequest;
import tn.esprit.chatbot.DTO.ChatbotResponse;
import tn.esprit.chatbot.Service.ChatbotService;
import tn.esprit.chatbot.Service.DatabaseSchemaService;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final DatabaseSchemaService schemaService;

    public ChatbotController(ChatbotService chatbotService, DatabaseSchemaService schemaService) {
        this.chatbotService = chatbotService;
        this.schemaService = schemaService;
    }

    /**
     * Ask the chatbot a natural language question about EverMind data.
     * 
     * Example: POST /chatbot/ask
     * Body: { "userId": 1, "question": "How many patients do we have?" }
     */
    @PostMapping("/ask")
    public ResponseEntity<ChatbotResponse> askQuestion(@RequestBody ChatbotRequest request) {
        if (request.getQuestion() == null || request.getQuestion().isBlank()) {
            return ResponseEntity.badRequest().body(
                    ChatbotResponse.builder()
                            .success(false)
                            .errorMessage("Question cannot be empty")
                            .build()
            );
        }
        if (request.getUserId() == null) {
            return ResponseEntity.badRequest().body(
                    ChatbotResponse.builder()
                            .success(false)
                            .errorMessage("userId is required")
                            .build()
            );
        }

        ChatbotResponse response = chatbotService.askQuestion(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get chat history for a user (last 20 interactions).
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<ChatbotResponse>> getHistory(@PathVariable("userId") Long userId) {
        List<ChatbotResponse> history = chatbotService.getHistory(userId);
        return ResponseEntity.ok(history);
    }

    /**
     * Clear chat history for a user.
     */
    @DeleteMapping("/history/{userId}")
    public ResponseEntity<Void> clearHistory(@PathVariable("userId") Long userId) {
        chatbotService.clearHistory(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * List all databases the chatbot can query.
     */
    @GetMapping("/databases")
    public ResponseEntity<Set<String>> getAvailableDatabases() {
        return ResponseEntity.ok(chatbotService.getAvailableDatabases());
    }

    /**
     * Health / info endpoint.
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getInfo() {
        return ResponseEntity.ok(Map.of(
                "service", "EverMind AI Chatbot",
                "version", "1.0.0",
                "databases", chatbotService.getAvailableDatabases().size(),
                "status", "operational"
        ));
    }

    /**
     * Force refresh the cached database schemas.
     */
    @PostMapping("/refresh-schema")
    public ResponseEntity<Map<String, String>> refreshSchema() {
        schemaService.refreshSchemas();
        return ResponseEntity.ok(Map.of("status", "Schema cache refreshed"));
    }
}
