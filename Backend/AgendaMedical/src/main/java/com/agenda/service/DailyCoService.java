package com.agenda.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class DailyCoService {

    @Value("${daily.api.key}")
    private String apiKey;

    @Value("${daily.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> createRoom(String roomName) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("name", roomName);
        body.put("privacy", "private");

        // Expiration automatique après 1 heure
        Map<String, Object> properties = new HashMap<>();
        properties.put("exp", System.currentTimeMillis() / 1000 + 3600);
        properties.put("enable_chat", true);
        properties.put("enable_screenshare", true);
        body.put("properties", properties);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
            apiUrl + "/rooms", request, Map.class
        );

        return response.getBody();
    }

    public String createMeetingToken(String roomName, String userName) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> properties = new HashMap<>();
        properties.put("room_name", roomName);
        properties.put("user_name", userName);
        properties.put("exp", System.currentTimeMillis() / 1000 + 3600);

        Map<String, Object> body = new HashMap<>();
        body.put("properties", properties);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
            apiUrl + "/meeting-tokens", request, Map.class
        );

        return (String) response.getBody().get("token");
    }
}
