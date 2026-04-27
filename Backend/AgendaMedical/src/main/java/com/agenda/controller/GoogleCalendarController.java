package com.agenda.controller;

import com.google.api.services.calendar.model.Event;
import com.agenda.service.GoogleCalendarService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/google-calendar")
@ConditionalOnProperty(name = "google.calendar.enabled", havingValue = "true")
public class GoogleCalendarController {

    private final GoogleCalendarService service;

    public GoogleCalendarController(GoogleCalendarService service) {
        this.service = service;
    }

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getEvents(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime day) {
        try {
            return ResponseEntity.ok(service.getEventsForDay(day));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
