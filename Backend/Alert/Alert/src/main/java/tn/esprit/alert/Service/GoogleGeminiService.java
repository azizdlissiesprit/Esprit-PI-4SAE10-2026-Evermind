package tn.esprit.alert.Service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j // Enables extensive logging
public class GoogleGeminiService {

    @Value("${google.api.key}")
    private String apiKey;

    // Using Gemini 1.5 Flash (Fast & Free Tier compatible)
    // ✅ Best choice - stable, fast, free tier, latest
    private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";
    private final RestTemplate restTemplate = new RestTemplate();

    public String analyzeAlert(String alertType, String message, String patientContext) {

        log.info("🤖 Preparing AI Analysis for Alert Type: {}", alertType);

        // 1. Construct the Prompt
        String promptText = String.format(
                "Act as a clinical expert system. Analyze this incident:\n" +
                        "Alert Type: %s\n" +
                        "Sensor Readings: %s\n" +
                        "Patient Context: %s\n" +
                        "Provide a concise, 2-sentence medical risk assessment and a recommended action. Do not use markdown.",
                alertType, message, patientContext
        );

        // 2. Build Gemini-specific JSON Structure
        // Structure: { "contents": [{ "parts": [{"text": "..."}] }] }
        Map<String, Object> part = new HashMap<>();
        part.put("text", promptText);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(part));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(content));

        // 3. Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 4. Execute Request
        try {
            String fullUrl = GEMINI_URL + apiKey;

            log.debug("📡 Sending Request to Google Gemini...");
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, entity, Map.class);

            log.info("✅ Response Received. Status: {}", response.getStatusCode());

            // 5. Parse Response
            return extractTextFromGeminiResponse(response.getBody());

        } catch (HttpClientErrorException e) {
            log.error("❌ HTTP Error from Google: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return "AI Analysis Failed: " + e.getStatusCode();
        } catch (Exception e) {
            log.error("❌ Unexpected Error during AI Call", e);
            return "AI Analysis Unavailable.";
        }
    }

    private String extractTextFromGeminiResponse(Map<String, Object> responseBody) {
        try {
            // Traverse the JSON: candidates[0].content.parts[0].text
            if (responseBody == null) return "No response body.";

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) return "No candidates returned by AI.";

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

            if (parts != null && !parts.isEmpty()) {
                String text = (String) parts.get(0).get("text");
                log.info("🧠 AI Output: {}", text);
                return text.trim();
            }
        } catch (Exception e) {
            log.error("⚠️ Error parsing Gemini JSON", e);
        }
        return "Could not parse AI response.";
    }
}