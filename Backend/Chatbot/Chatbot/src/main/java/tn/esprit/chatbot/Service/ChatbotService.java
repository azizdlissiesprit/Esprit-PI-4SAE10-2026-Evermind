package tn.esprit.chatbot.Service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.chatbot.DTO.ChatbotRequest;
import tn.esprit.chatbot.DTO.ChatbotResponse;
import tn.esprit.chatbot.Entity.ChatbotInteraction;
import tn.esprit.chatbot.Repository.ChatbotInteractionRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.HashMap;
import org.springframework.web.client.RestTemplate;

/**
 * Core chatbot orchestration service.
 * Flow: User question → Gemini (NL→SQL) → JDBC execute → Gemini (results→answer)
 */
@Service
@Slf4j
public class ChatbotService {

    private final DatabaseSchemaService schemaService;
    private final GeminiService geminiService;
    private final ChatbotInteractionRepository interactionRepository;
    private final Map<String, JdbcTemplate> queryJdbcTemplates;

    // SQL safety patterns — block any data-modifying statements
    private static final Pattern DANGEROUS_SQL = Pattern.compile(
            "\\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|EXEC|EXECUTE|MERGE|CALL)\\b",
            Pattern.CASE_INSENSITIVE
    );

    // Memory routing logic
    private static final Pattern MEMORY_QUESTION = Pattern.compile(
            "\\b(remember|memory|who is|my daughter|my son|my wife|my address|my dog|routine|where do i|visit me|my)\\b",
            Pattern.CASE_INSENSITIVE
    );
    
    private final RestTemplate restTemplate = new RestTemplate();

    private static final int MAX_ROWS = 100;

    public ChatbotService(DatabaseSchemaService schemaService,
                          GeminiService geminiService,
                          ChatbotInteractionRepository interactionRepository,
                          Map<String, JdbcTemplate> queryJdbcTemplates) {
        this.schemaService = schemaService;
        this.geminiService = geminiService;
        this.interactionRepository = interactionRepository;
        this.queryJdbcTemplates = queryJdbcTemplates;
    }

    /**
     * Main entry point: process a user's natural language question.
     */
    public ChatbotResponse askQuestion(ChatbotRequest request) {
        log.info("Processing question from user {}: '{}'", request.getUserId(), request.getQuestion());
        long startTime = System.currentTimeMillis();

        try {
            // Intercept personal memory questions and forward to Python RAG service
            if (MEMORY_QUESTION.matcher(request.getQuestion()).find()) {
                return fetchFromMemoryBank(request);
            }

            // Step 1: Get the schema description for the LLM prompt
            String schemaPrompt = schemaService.getSchemaPromptFragment();

            if (schemaPrompt.isBlank()) {
                return buildErrorResponse(request, null, null,
                        "I'm still loading the database schemas. Please try again in a moment.");
            }

            // Step 2: Ask Gemini to generate SQL from the question
            GeminiService.GeminiSqlResult sqlResult = geminiService.generateSQL(schemaPrompt, request.getQuestion());

            if (!sqlResult.isValid()) {
                String reason = sqlResult.errorReason() != null
                        ? sqlResult.errorReason()
                        : "I couldn't figure out how to query the database for that. Could you rephrase your question?";
                return buildErrorResponse(request, null, null, reason);
            }

            String dbName = sqlResult.databaseName();
            String sql = sqlResult.sql();

            log.info("Generated SQL for database '{}': {}", dbName, sql);

            // Step 3: Validate the SQL (safety check)
            String validationError = validateSql(sql, dbName);
            if (validationError != null) {
                return buildErrorResponse(request, sql, dbName, validationError);
            }

            // Step 4: Execute the SQL query
            String queryResults = executeQuery(dbName, sql);

            // Step 5: Ask Gemini to generate a human-readable answer
            String answer = geminiService.generateAnswer(request.getQuestion(), sql, queryResults, dbName);

            long elapsed = System.currentTimeMillis() - startTime;
            log.info("Question answered in {}ms", elapsed);

            // Step 6: Save the interaction and return
            ChatbotInteraction interaction = ChatbotInteraction.builder()
                    .userId(request.getUserId())
                    .question(request.getQuestion())
                    .generatedSql(sql)
                    .answer(answer)
                    .databaseQueried(dbName)
                    .success(true)
                    .build();
            interaction = interactionRepository.save(interaction);

            return ChatbotResponse.builder()
                    .interactionId(interaction.getId())
                    .question(request.getQuestion())
                    .answer(answer)
                    .generatedSql(sql)
                    .databaseQueried(dbName)
                    .timestamp(interaction.getTimestamp())
                    .success(true)
                    .build();

        } catch (Exception e) {
            log.error("Error processing question: {}", e.getMessage(), e);
            return buildErrorResponse(request, null, null,
                    "Sorry, something went wrong while processing your question. Please try again.");
        }
    }

    /**
     * Get chat history for a user.
     */
    public List<ChatbotResponse> getHistory(Long userId) {
        return interactionRepository.findTop20ByUserIdOrderByTimestampDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Clear chat history for a user.
     */
    @Transactional
    public void clearHistory(Long userId) {
        interactionRepository.deleteByUserId(userId);
    }

    /**
     * Return list of available databases the chatbot can query.
     */
    public Set<String> getAvailableDatabases() {
        return schemaService.getAvailableDatabases();
    }

    /**
     * Call the Python MemoryBankService for RAG questions
     */
    private ChatbotResponse fetchFromMemoryBank(ChatbotRequest request) {
        log.info("Routing personal question to Python MemoryBankService...");
        try {
            // Use host.docker.internal to allow the Dockerized Chatbot to reach the Python service running on the host machine
            String memoryBankUrl = "http://host.docker.internal:8000/ask";
            Map<String, String> payload = new HashMap<>();
            payload.put("query", request.getQuestion());
            
            // Note: In a fully configured Eureka setup, we would use http://MEMORY-BANK-SERVICE/ask
            // with a @LoadBalanced RestTemplate. For this integration, direct localhost call is perfectly fine.
            @SuppressWarnings("unchecked")
            Map<String, String> pythonResponse = restTemplate.postForObject(memoryBankUrl, payload, Map.class);
            
            String answer = pythonResponse != null ? pythonResponse.get("answer") : "The Memory Bank did not return an answer.";
            
            ChatbotInteraction interaction = ChatbotInteraction.builder()
                    .userId(request.getUserId())
                    .question(request.getQuestion())
                    .answer(answer)
                    .databaseQueried("MEMORY-BANK-SERVICE (VectorDB)")
                    .generatedSql("RAG Vector Context Only")
                    .success(true)
                    .build();
            interaction = interactionRepository.save(interaction);

            return toResponse(interaction);
        } catch (Exception e) {
            log.error("Failed to query Python MemoryBankService: {}", e.getMessage());
            return buildErrorResponse(request, null, "MEMORY-BANK-SERVICE", "Could not reach the memory bank: " + e.getMessage());
        }
    }

    // ===== PRIVATE HELPERS =====

    /**
     * Validates the generated SQL for safety.
     */
    private String validateSql(String sql, String dbName) {
        if (sql == null || sql.isBlank()) {
            return "No SQL query was generated.";
        }

        // Block dangerous operations
        if (DANGEROUS_SQL.matcher(sql).find()) {
            log.warn("BLOCKED dangerous SQL: {}", sql);
            return "I can only read data, not modify it. Please ask a read-only question.";
        }

        // Must start with SELECT or WITH (for CTEs)
        String upperSql = sql.trim().toUpperCase();
        if (!upperSql.startsWith("SELECT") && !upperSql.startsWith("WITH")) {
            log.warn("BLOCKED non-SELECT SQL: {}", sql);
            return "I can only run SELECT queries. Please ask a question about reading data.";
        }

        // Check the target database exists
        if (!queryJdbcTemplates.containsKey(dbName)) {
            log.warn("Unknown database requested: {}", dbName);
            return "I don't have access to the database '" + dbName + "'. Available databases: "
                    + String.join(", ", queryJdbcTemplates.keySet());
        }

        return null; // Valid
    }

    /**
     * Execute a read-only SQL query against the specified database.
     */
    private String executeQuery(String dbName, String sql) {
        JdbcTemplate jdbc = queryJdbcTemplates.get(dbName);
        if (jdbc == null) {
            throw new RuntimeException("No JDBC connection for database: " + dbName);
        }

        try {
            // Ensure LIMIT exists to prevent huge result sets
            String safeSql = ensureLimit(sql);

            List<Map<String, Object>> rows = jdbc.queryForList(safeSql);

            if (rows.isEmpty()) {
                return "(no results)";
            }

            // Format results as a simple text table
            StringBuilder sb = new StringBuilder();
            // Header
            Set<String> columns = rows.get(0).keySet();
            sb.append(String.join(" | ", columns)).append("\n");
            sb.append("-".repeat(columns.size() * 15)).append("\n");

            // Rows
            for (Map<String, Object> row : rows) {
                sb.append(columns.stream()
                        .map(col -> String.valueOf(row.get(col)))
                        .collect(Collectors.joining(" | ")))
                        .append("\n");
            }

            sb.append("\n(").append(rows.size()).append(" row(s))");
            return sb.toString();

        } catch (Exception e) {
            log.error("SQL execution error on {}: {}", dbName, e.getMessage());
            throw new RuntimeException("Query failed: " + e.getMessage());
        }
    }

    /**
     * Adds LIMIT clause if missing.
     */
    private String ensureLimit(String sql) {
        String upper = sql.toUpperCase().trim();
        if (!upper.contains("LIMIT")) {
            // Remove trailing semicolon if present
            String clean = sql.trim();
            if (clean.endsWith(";")) {
                clean = clean.substring(0, clean.length() - 1);
            }
            return clean + " LIMIT " + MAX_ROWS;
        }
        return sql;
    }

    /**
     * Build an error response and persist it.
     */
    private ChatbotResponse buildErrorResponse(ChatbotRequest request, String sql, String dbName, String errorMessage) {
        ChatbotInteraction interaction = ChatbotInteraction.builder()
                .userId(request.getUserId())
                .question(request.getQuestion())
                .generatedSql(sql)
                .answer(errorMessage)
                .databaseQueried(dbName)
                .success(false)
                .errorMessage(errorMessage)
                .build();
        interaction = interactionRepository.save(interaction);

        return ChatbotResponse.builder()
                .interactionId(interaction.getId())
                .question(request.getQuestion())
                .answer(errorMessage)
                .generatedSql(sql)
                .databaseQueried(dbName)
                .timestamp(interaction.getTimestamp())
                .success(false)
                .errorMessage(errorMessage)
                .build();
    }

    private ChatbotResponse toResponse(ChatbotInteraction i) {
        return ChatbotResponse.builder()
                .interactionId(i.getId())
                .question(i.getQuestion())
                .answer(i.getAnswer())
                .generatedSql(i.getGeneratedSql())
                .databaseQueried(i.getDatabaseQueried())
                .timestamp(i.getTimestamp())
                .success(i.getSuccess())
                .errorMessage(i.getErrorMessage())
                .build();
    }
}
