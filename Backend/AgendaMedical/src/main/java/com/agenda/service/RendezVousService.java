package com.agenda.service;

import com.agenda.dto.RendezVousDTO;
import com.agenda.dto.RendezVousStats;
import com.agenda.entity.RendezVous;
import com.agenda.repository.RendezVousRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RendezVousService {

    private static final Logger log = LoggerFactory.getLogger(RendezVousService.class);

    private final RendezVousRepository repository;
    private final GoogleCalendarService googleCalendarService;

    public RendezVousService(RendezVousRepository repository,
                             @Autowired(required = false) GoogleCalendarService googleCalendarService) {
        this.repository = repository;
        this.googleCalendarService = googleCalendarService;
    }

    // Lecture
    @Transactional(readOnly = true)
    public List<RendezVousDTO> getBySemaine(LocalDate debutSemaine) {
        LocalDateTime debut = debutSemaine.atStartOfDay();
        LocalDateTime fin   = debutSemaine.plusDays(7).atStartOfDay();
        return repository
                .findByDateHeureBetweenOrderByDateHeure(debut, fin)
                .stream()
                .map(RendezVousDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RendezVousDTO> getByJour(LocalDate jour) {
        LocalDateTime debut = jour.atStartOfDay();
        LocalDateTime fin   = jour.plusDays(1).atStartOfDay();
        return repository
                .findByDateHeureBetweenOrderByDateHeure(debut, fin)
                .stream()
                .map(RendezVousDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RendezVousDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(RendezVousDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RendezVousDTO getById(Long id) {
        RendezVous rdv = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("RDV introuvable : id=" + id));
        return RendezVousDTO.fromEntity(rdv);
    }

    // Créer
    public RendezVousDTO create(RendezVousDTO dto) {
        RendezVous rdv   = dto.toEntity();
        RendezVous saved = repository.save(rdv);

        // Synchroniser avec Google Calendar
        if (googleCalendarService != null) {
            try {
                String googleId = googleCalendarService.createEvent(
                        RendezVousDTO.fromEntity(saved));
                saved.setGoogleEventId(googleId);
                repository.save(saved);
                log.info("RDV {} synchronisé avec Google Calendar (eventId={})",
                        saved.getId(), googleId);
            } catch (Exception e) {
                log.warn("Impossible de synchroniser avec Google Calendar : {}", e.getMessage());
            }
        }

        return RendezVousDTO.fromEntity(saved);
    }

    // Modifier
    public RendezVousDTO update(Long id, RendezVousDTO dto) {
        RendezVous existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("RDV introuvable : id=" + id));

        existing.setPatientNom(dto.getPatientNom());
        existing.setPatientPrenom(dto.getPatientPrenom());
        existing.setType(dto.getType());
        existing.setStatut(dto.getStatut());
        existing.setDateHeure(dto.getDateHeure());
        existing.setDureeMinutes(dto.getDureeMinutes());
        existing.setNotes(dto.getNotes());

        RendezVous saved = repository.save(existing);

        // Mettre à jour dans Google Calendar
        if (googleCalendarService != null && saved.getGoogleEventId() != null) {
            try {
                googleCalendarService.updateEvent(
                        saved.getGoogleEventId(),
                        RendezVousDTO.fromEntity(saved));
                log.info("RDV {} mis à jour dans Google Calendar", saved.getId());
            } catch (Exception e) {
                log.warn("Impossible de mettre à jour Google Calendar : {}", e.getMessage());
            }
        }

        return RendezVousDTO.fromEntity(saved);
    }

    // Supprimer
    public void delete(Long id) {
        RendezVous existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("RDV introuvable : id=" + id));

        // Supprimer de Google Calendar
        if (googleCalendarService != null && existing.getGoogleEventId() != null) {
            try {
                googleCalendarService.deleteEvent(existing.getGoogleEventId());
                log.info("RDV {} supprimé de Google Calendar", id);
            } catch (Exception e) {
                log.warn("Impossible de supprimer de Google Calendar : {}", e.getMessage());
            }
        }

        repository.deleteById(id);
    }

    // Statistiques
    @Transactional(readOnly = true)
    public RendezVousStats getStats() {
        LocalDateTime debutJour = LocalDate.now().atStartOfDay();
        LocalDateTime finJour = LocalDate.now().plusDays(1).atStartOfDay();
        LocalDateTime debutSemaine = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime finSemaine = LocalDate.now().with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).plusDays(1).atStartOfDay();

        long totalJour = repository.countByPeriode(debutJour, finJour);
        long totalSemaine = repository.countByPeriode(debutSemaine, finSemaine);
        long confirmes = repository.countConfirmesByPeriode(debutJour, finJour);
        long enAttente = totalJour - confirmes - repository.countAnnulesByPeriode(debutJour, finJour);
        long annules = repository.countAnnulesByPeriode(debutJour, finJour);

        return new RendezVousStats(totalJour, totalSemaine, confirmes, enAttente, annules);
    }

    // Recherche
    @Transactional(readOnly = true)
    public List<RendezVousDTO> search(String term) {
        return repository.findByPatientNomContainingIgnoreCaseOrPatientPrenomContainingIgnoreCase(term, term)
                .stream()
                .map(RendezVousDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
