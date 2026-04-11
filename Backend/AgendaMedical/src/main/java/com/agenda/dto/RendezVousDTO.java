package com.agenda.dto;

import com.agenda.entity.RendezVous;
import java.time.LocalDateTime;

public class RendezVousDTO {
    private Long id;
    private String patientNom;
    private String patientPrenom;
    private RendezVous.TypeRDV type;
    private RendezVous.StatutRDV statut;
    private LocalDateTime dateHeure;
    private int dureeMinutes;
    private String notes;
    private String googleEventId;

    // Constructeurs
    public RendezVousDTO() {}

    // Getters / Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPatientNom() { return patientNom; }
    public void setPatientNom(String patientNom) { this.patientNom = patientNom; }

    public String getPatientPrenom() { return patientPrenom; }
    public void setPatientPrenom(String patientPrenom) { this.patientPrenom = patientPrenom; }

    public RendezVous.TypeRDV getType() { return type; }
    public void setType(RendezVous.TypeRDV type) { this.type = type; }

    public RendezVous.StatutRDV getStatut() { return statut; }
    public void setStatut(RendezVous.StatutRDV statut) { this.statut = statut; }

    public LocalDateTime getDateHeure() { return dateHeure; }
    public void setDateHeure(LocalDateTime dateHeure) { this.dateHeure = dateHeure; }

    public int getDureeMinutes() { return dureeMinutes; }
    public void setDureeMinutes(int dureeMinutes) { this.dureeMinutes = dureeMinutes; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getGoogleEventId() { return googleEventId; }
    public void setGoogleEventId(String googleEventId) { this.googleEventId = googleEventId; }

    // Méthodes de conversion
    public static RendezVousDTO fromEntity(RendezVous entity) {
        RendezVousDTO dto = new RendezVousDTO();
        dto.setId(entity.getId());
        dto.setPatientNom(entity.getPatientNom());
        dto.setPatientPrenom(entity.getPatientPrenom());
        dto.setType(entity.getType());
        dto.setStatut(entity.getStatut());
        dto.setDateHeure(entity.getDateHeure());
        dto.setDureeMinutes(entity.getDureeMinutes());
        dto.setNotes(entity.getNotes());
        dto.setGoogleEventId(entity.getGoogleEventId());
        return dto;
    }

    public RendezVous toEntity() {
        RendezVous entity = new RendezVous();
        entity.setId(this.id);
        entity.setPatientNom(this.patientNom);
        entity.setPatientPrenom(this.patientPrenom);
        entity.setType(this.type);
        entity.setStatut(this.statut);
        entity.setDateHeure(this.dateHeure);
        entity.setDureeMinutes(this.dureeMinutes);
        entity.setNotes(this.notes);
        entity.setGoogleEventId(this.googleEventId);
        return entity;
    }
}
