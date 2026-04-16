package tn.esprit.formation.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openai.azure.credential.AzureApiKeyCredential;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tn.esprit.formation.Entity.Question;
import tn.esprit.formation.Entity.QuestionType;
import tn.esprit.formation.Entity.Quiz;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiQuizGenerationService {

    @Value("${azure.openai.endpoint}")
    private String endpoint;

    @Value("${azure.openai.api-key}")
    private String apiKey;

    @Value("${azure.openai.deployment-name}")
    private String deploymentName;

    private OpenAIClient client;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        client = OpenAIOkHttpClient.builder()
                .baseUrl(endpoint)
                .credential(AzureApiKeyCredential.create(apiKey))
                .build();
    }

    /**
     * Generate quiz questions using the Kimi K2.5 LLM.
     *
     * @param quiz              the quiz to attach questions to
     * @param moduleTitle       the title of the module
     * @param moduleContent     the text content of the module
     * @param topic             the specific topic to focus questions on
     * @param numberOfQuestions how many questions to generate
     * @param questionTypes     which question types to use (QCU, QCM, TRUE_FALSE)
     * @param startIndex        the starting orderIndex for the generated questions
     * @return list of Question entities (not yet persisted)
     */
    public List<Question> generateQuestions(
            Quiz quiz,
            String moduleTitle,
            String moduleContent,
            String topic,
            int numberOfQuestions,
            List<String> questionTypes,
            int startIndex
    ) {
        String typesDescription = String.join(", ", questionTypes);

        String systemPrompt = """
                You are an expert quiz generator for educational courses. \
                You generate high-quality quiz questions based on the provided module content.

                RULES:
                - Generate exactly %d question(s).
                - Use ONLY these question types: %s
                  - QCU = single-correct-answer multiple choice (exactly 1 correct index)
                  - QCM = multiple-correct-answers multiple choice (2+ correct indices)
                  - TRUE_FALSE = true/false question with options ["Vrai","Faux"] (correct index 0 for true, 1 for false)
                - Each question MUST have 4 options (except TRUE_FALSE which has exactly 2).
                - The "correctAnswers" field is a JSON array of zero-based indices of the correct option(s).
                - Make questions diverse, testing different aspects of the topic.
                - Questions should be in the SAME LANGUAGE as the module content.

                You MUST respond with ONLY a valid JSON array (no markdown, no explanation), for example:
                [
                  {
                    "questionText": "What is ...?",
                    "type": "QCU",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswers": [2]
                  }
                ]
                """.formatted(numberOfQuestions, typesDescription);

        String userPrompt = """
                Module title: %s

                Module content:
                %s

                Topic to focus on: %s

                Generate %d question(s) using types: %s
                """.formatted(
                moduleTitle,
                moduleContent != null && !moduleContent.isBlank() ? moduleContent : "(No specific content provided — use general knowledge about the topic)",
                topic,
                numberOfQuestions,
                typesDescription
        );

        ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                .model(ChatModel.of(deploymentName))
                .addSystemMessage(systemPrompt)
                .addUserMessage(userPrompt)
                .build();

        ChatCompletion completion = client.chat().completions().create(params);

        String rawResponse = completion.choices().get(0).message().content().orElse("[]");

        // Strip markdown fences if the LLM wraps the response in ```json ... ```
        rawResponse = rawResponse.strip();
        if (rawResponse.startsWith("```")) {
            int firstNewline = rawResponse.indexOf('\n');
            rawResponse = rawResponse.substring(firstNewline + 1);
            if (rawResponse.endsWith("```")) {
                rawResponse = rawResponse.substring(0, rawResponse.length() - 3).strip();
            }
        }

        return parseQuestions(rawResponse, quiz, startIndex);
    }

    private List<Question> parseQuestions(String json, Quiz quiz, int startIndex) {
        try {
            List<Map<String, Object>> items = objectMapper.readValue(json, new TypeReference<>() {});
            List<Question> questions = new ArrayList<>();

            for (int i = 0; i < items.size(); i++) {
                Map<String, Object> item = items.get(i);
                Question q = new Question();
                q.setQuiz(quiz);
                q.setQuestionText((String) item.get("questionText"));
                q.setType(QuestionType.valueOf((String) item.get("type")));

                // options: convert List<String> to JSON string
                Object opts = item.get("options");
                q.setOptions(objectMapper.writeValueAsString(opts));

                // correctAnswers: convert List<Integer> to JSON string
                Object correct = item.get("correctAnswers");
                q.setCorrectAnswers(objectMapper.writeValueAsString(correct));

                q.setOrderIndex(startIndex + i);
                questions.add(q);
            }
            return questions;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI-generated questions: " + e.getMessage(), e);
        }
    }
}
