package tn.esprit.chatbot.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

/**
 * Wrapper around the Google Gemini REST API.
 * Handles SQL generation and natural-language answer generation.
 */
@Service
@Slf4j
public class GeminiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    @Value("${gemini.max-tokens}")
    private int maxTokens;

    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    public GeminiService() {
        this.restClient = RestClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Generate a SQL query from a natural language question + database schema.
     * Returns ONLY the raw SQL string (no markdown, no explanation).
     */
    public GeminiSqlResult generateSQL(String schemaDescription, String userQuestion) {
        String systemPrompt = """
            You are a PostgreSQL SQL expert for a medical Alzheimer's patient care platform called EverMind.
            The system uses multiple separate PostgreSQL databases, one per microservice.
            
            RULES:
            1. Generate ONLY a single valid PostgreSQL SELECT query. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, or any data-modifying statement.
            2. Return ONLY the raw SQL — no markdown, no backticks, no explanation.
            3. If the question requires data from multiple databases, generate ONLY ONE query for the MOST RELEVANT database. You CANNOT join across databases.
            4. On the FIRST line of your response, write ONLY the database name to query (exactly as listed in the schema).
            5. On the SECOND line onward, write ONLY the SQL query.
            6. Use LIMIT 100 unless the user explicitly asks for more.
            7. Be careful with column names — use the EXACT column names from the schema.
            8. For date filtering, use PostgreSQL date functions (NOW(), INTERVAL, etc.).
            9. If the question cannot be answered with the available schema, respond with:
               NONE
               CANNOT_ANSWER: <brief reason>
            
            IMPORTANT CONTEXT:
            - The "User" database has a "users" table with user_id, first_name, last_name, email, user_type, etc.
            - The "Patient" database has a "patients" table with patient demographics, medical data, room assignments, etc.
            - The "Alert" database has an "alerts" table tracking medical alerts with severity levels.
            - The "Intervention" database tracks care interventions by staff.
            - The "autonomy" and "cognitive_assessment" databases track patient assessment scores over time.
            - The "SensorSimulator" database has IoT sensor readings and abnormal events.
            - Patient IDs and User IDs are cross-referenced across databases but stored separately.
            """;

        String userPrompt = "DATABASE SCHEMA:\n" + schemaDescription + "\n\nUSER QUESTION: " + userQuestion;

        String response = callGemini(systemPrompt, userPrompt);
        return parseSqlResponse(response);
    }

    /**
     * Generate a human-readable answer from SQL query results.
     */
    public String generateAnswer(String userQuestion, String sqlQuery, String queryResults, String databaseName) {
        String systemPrompt = """
            You are a friendly, helpful AI assistant for EverMind, an Alzheimer's patient care platform.
            You just queried the database and got results. Now explain them in a clear, concise, human-readable way.
            
            RULES:
            1. Be conversational but professional — this is a medical system.
            2. If the results are empty, say so politely and suggest what the user might try.
            3. Format numbers nicely (e.g., percentages, counts).
            4. If results contain patient data, present it in a structured way.
            5. Keep your response concise — 2-4 sentences for simple queries, a formatted list for multi-row results.
            6. Do NOT include the SQL query or technical details in your response.
            7. Use natural date formatting (e.g., "3 days ago" instead of "2026-04-08T...").
            8. If asked, round decimal numbers to 1-2 decimal places.
            """;

        String userPrompt = String.format(
                "QUESTION: %s\n\nDATABASE QUERIED: %s\n\nSQL USED: %s\n\nRESULTS:\n%s",
                userQuestion, databaseName, sqlQuery, queryResults
        );

        return callGemini(systemPrompt, userPrompt);
    }

    /**
     * Core Gemini API call.
     */
    private String callGemini(String systemPrompt, String userPrompt) {
        try {
            String url = GEMINI_BASE_URL + model + ":generateContent?key=" + apiKey;

            // Build request body
            ObjectNode requestBody = objectMapper.createObjectNode();

            // System instruction
            ObjectNode systemInstruction = objectMapper.createObjectNode();
            ObjectNode systemPart = objectMapper.createObjectNode();
            systemPart.put("text", systemPrompt);
            ArrayNode systemParts = objectMapper.createArrayNode();
            systemParts.add(systemPart);
            systemInstruction.set("parts", systemParts);
            requestBody.set("system_instruction", systemInstruction);

            // User content
            ArrayNode contents = objectMapper.createArrayNode();
            ObjectNode userContent = objectMapper.createObjectNode();
            userContent.put("role", "user");
            ObjectNode userPart = objectMapper.createObjectNode();
            userPart.put("text", userPrompt);
            ArrayNode userParts = objectMapper.createArrayNode();
            userParts.add(userPart);
            userContent.set("parts", userParts);
            contents.add(userContent);
            requestBody.set("contents", contents);

            // Generation config
            ObjectNode genConfig = objectMapper.createObjectNode();
            genConfig.put("maxOutputTokens", maxTokens);
            genConfig.put("temperature", 0.1); // Low temp for precise SQL / factual answers
            requestBody.set("generationConfig", genConfig);

            String body = objectMapper.writeValueAsString(requestBody);

            log.debug("Calling Gemini API: {}", model);

            ResponseEntity<String> response = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toEntity(String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return extractTextFromGeminiResponse(response.getBody());
            } else {
                log.error("Gemini API error: status={}", response.getStatusCode());
                throw new RuntimeException("Gemini API returned status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to call Gemini API: " + e.getMessage(), e);
        }
    }

    /**
     * Extract the text content from Gemini's JSON response.
     */
    private String extractTextFromGeminiResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode content = firstCandidate.path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText("");
                }
            }
            log.warn("Unexpected Gemini response structure: {}", jsonResponse);
            return "I couldn't process that request. Please try rephrasing your question.";
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            return "I couldn't process that request. Please try rephrasing your question.";
        }
    }

    /**
     * Parse the SQL generation response into database name + SQL query.
     */
    private GeminiSqlResult parseSqlResponse(String response) {
        if (response == null || response.isBlank()) {
            return new GeminiSqlResult("NONE", null, "Empty response from AI");
        }

        String trimmed = response.trim();

        // Check if the AI says it can't answer
        if (trimmed.startsWith("NONE")) {
            String reason = trimmed.contains("CANNOT_ANSWER:")
                    ? trimmed.substring(trimmed.indexOf("CANNOT_ANSWER:") + 14).trim()
                    : "This question cannot be answered with the available data.";
            return new GeminiSqlResult("NONE", null, reason);
        }

        // Split into lines: first line = database name, rest = SQL
        String[] lines = trimmed.split("\n", 2);
        if (lines.length < 2) {
            return new GeminiSqlResult("NONE", null, "Invalid AI response format");
        }

        String dbName = lines[0].trim();
        String sql = lines[1].trim();

        // Clean up any markdown code fences the model might sneak in
        sql = sql.replaceAll("^```sql\\s*", "").replaceAll("^```\\s*", "").replaceAll("\\s*```$", "").trim();

        return new GeminiSqlResult(dbName, sql, null);
    }

    // --- Result type ---

    public record GeminiSqlResult(String databaseName, String sql, String errorReason) {
        public boolean isValid() {
            return sql != null && !sql.isBlank() && !"NONE".equals(databaseName);
        }
    }
}
