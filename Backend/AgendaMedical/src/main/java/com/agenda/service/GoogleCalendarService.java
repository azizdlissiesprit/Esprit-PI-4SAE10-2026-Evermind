package com.agenda.service;

import com.agenda.dto.RendezVousDTO;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.EventReminder;
import com.google.api.services.calendar.model.Events;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Service
public class GoogleCalendarService {

    private static final String TIMEZONE       = "Africa/Tunis";
    private static final String COLOR_BLUE     = "1";
    private static final String COLOR_GREEN    = "2";
    private static final String COLOR_PURPLE   = "3";
    private static final String COLOR_RED      = "4";
    private static final String COLOR_YELLOW   = "5";
    private static final String COLOR_TEAL     = "7";

    private final Calendar calendarService;

    @Value("${google.calendar.calendar-id}")
    private String calendarId;

    public GoogleCalendarService(Calendar googleCalendarClient) {
        this.calendarService = googleCalendarClient;
    }

    // Créer un événement Google Calendar à partir d'un RDV
    public String createEvent(RendezVousDTO rdv) throws IOException {
        Event event = buildEvent(rdv);
        Event created = calendarService
                .events()
                .insert(calendarId, event)
                .execute();
        return created.getId();  // Stocker cet ID dans la base pour les mises à jour
    }

    // Mettre à jour un événement existant
    public void updateEvent(String googleEventId, RendezVousDTO rdv) throws IOException {
        Event event = buildEvent(rdv);
        calendarService
                .events()
                .update(calendarId, googleEventId, event)
                .execute();
    }

    // Supprimer un événement
    public void deleteEvent(String googleEventId) throws IOException {
        calendarService
                .events()
                .delete(calendarId, googleEventId)
                .execute();
    }

    // Récupérer tous les événements d'une journée
    public List<Event> getEventsForDay(LocalDateTime day) throws IOException {
        ZonedDateTime startOfDay = day.toLocalDate()
                .atStartOfDay(ZoneId.of(TIMEZONE));
        ZonedDateTime endOfDay   = startOfDay.plusDays(1);

        Events events = calendarService
                .events()
                .list(calendarId)
                .setTimeMin(new DateTime(startOfDay.toInstant().toEpochMilli()))
                .setTimeMax(new DateTime(endOfDay.toInstant().toEpochMilli()))
                .setOrderBy("startTime")
                .setSingleEvents(true)
                .execute();

        return events.getItems();
    }

    // Construction de l'événement Google Calendar
    private Event buildEvent(RendezVousDTO rdv) {
        // Dates début et fin
        LocalDateTime debut = rdv.getDateHeure();
        LocalDateTime fin   = debut.plusMinutes(rdv.getDureeMinutes());

        String debutISO = toGoogleDateTime(debut);
        String finISO   = toGoogleDateTime(fin);

        // Titre et description
        String titre = String.format("RDV - %s %s (%s)",
                rdv.getPatientNom(),
                rdv.getPatientPrenom(),
                getTypeLabel(rdv.getType().toString())
        );

        String description = String.format(
                "Patient : %s %s\n" +
                "Type    : %s\n"    +
                "Statut  : %s\n"    +
                "Durée   : %d min\n"+
                "Notes   : %s",
                rdv.getPatientNom(),
                rdv.getPatientPrenom(),
                getTypeLabel(rdv.getType().toString()),
                getStatutLabel(rdv.getStatut().toString()),
                rdv.getDureeMinutes(),
                rdv.getNotes() != null ? rdv.getNotes() : ""
        );

        // Rappels : 24h avant et 30 min avant
        Event.Reminders reminders = new Event.Reminders()
                .setUseDefault(false)
                .setOverrides(Arrays.asList(
                        new EventReminder().setMethod("email").setMinutes(24 * 60),
                        new EventReminder().setMethod("popup").setMinutes(30)
                ));

        return new Event()
                .setSummary(titre)
                .setDescription(description)
                .setColorId(getColorForType(rdv.getType().toString()))
                .setStart(new EventDateTime()
                        .setDateTime(new DateTime(debutISO))
                        .setTimeZone(TIMEZONE))
                .setEnd(new EventDateTime()
                        .setDateTime(new DateTime(finISO))
                        .setTimeZone(TIMEZONE))
                .setReminders(reminders);
    }

    // Helpers
    private String toGoogleDateTime(LocalDateTime ldt) {
        return ZonedDateTime.of(ldt, ZoneId.of(TIMEZONE))
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }

    private String getColorForType(String type) {
        return switch (type) {
            case "TELECONSULTATION" -> COLOR_RED;
            case "SUIVI"            -> COLOR_GREEN;
            case "BILAN"            -> COLOR_YELLOW;
            case "EVALUATION"       -> COLOR_PURPLE;
            case "RESULTATS"        -> COLOR_TEAL;
            case "PREMIERE_VISITE"  -> COLOR_BLUE;
            default                 -> COLOR_BLUE;  // CONSULTATION
        };
    }

    private String getTypeLabel(String type) {
        return switch (type) {
            case "CONSULTATION"     -> "Consultation";
            case "TELECONSULTATION" -> "Téléconsultation";
            case "SUIVI"            -> "Suivi";
            case "BILAN"            -> "Bilan";
            case "EVALUATION"       -> "Évaluation";
            case "RESULTATS"        -> "Résultats";
            case "PREMIERE_VISITE"  -> "1ère visite";
            default                 -> type;
        };
    }

    private String getStatutLabel(String statut) {
        return switch (statut) {
            case "CONFIRME"   -> "Confirmé";
            case "EN_ATTENTE" -> "En attente";
            case "ANNULE"     -> "Annulé";
            default           -> statut;
        };
    }
}
