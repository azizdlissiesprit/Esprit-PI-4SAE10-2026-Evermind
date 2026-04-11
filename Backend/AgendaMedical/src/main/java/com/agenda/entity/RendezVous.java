package com.agenda.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rendez_vous")
public class RendezVous {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String patientNom;

    @Column(nullable = false)
    private String patientPrenom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeRDV type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutRDV statut;

    @Column(nullable = false)
    private LocalDateTime dateHeure;

    @Column(nullable = false)
    private Integer dureeMinutes;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "google_event_id")
    private String googleEventId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Enums
    public enum TypeRDV {
        CONSULTATION,
        TELECONSULTATION,
        SUIVI,
        BILAN,
        EVALUATION,
        RESULTATS,
        PREMIERE_VISITE
    }

    public enum StatutRDV {
        CONFIRME,
        EN_ATTENTE,
        ANNULE,
        LIBRE
    }

    // Constructors
    public RendezVous() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public RendezVous(String patientNom, String patientPrenom, TypeRDV type, StatutRDV statut, 
                     LocalDateTime dateHeure, Integer dureeMinutes, String notes) {
        this();
        this.patientNom = patientNom;
        this.patientPrenom = patientPrenom;
        this.type = type;
        this.statut = statut;
        this.dateHeure = dateHeure;
        this.dureeMinutes = dureeMinutes;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPatientNom() {
        return patientNom;
    }

    public void setPatientNom(String patientNom) {
        this.patientNom = patientNom;
        this.updatedAt = LocalDateTime.now();
    }

    public String getPatientPrenom() {
        return patientPrenom;
    }

    public void setPatientPrenom(String patientPrenom) {
        this.patientPrenom = patientPrenom;
        this.updatedAt = LocalDateTime.now();
    }

    public TypeRDV getType() {
        return type;
    }

    public void setType(TypeRDV type) {
        this.type = type;
        this.updatedAt = LocalDateTime.now();
    }

    public StatutRDV getStatut() {
        return statut;
    }

    public void setStatut(StatutRDV statut) {
        this.statut = statut;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getDateHeure() {
        return dateHeure;
    }

    public void setDateHeure(LocalDateTime dateHeure) {
        this.dateHeure = dateHeure;
        this.updatedAt = LocalDateTime.now();
    }

    public Integer getDureeMinutes() {
        return dureeMinutes;
    }

    public void setDureeMinutes(Integer dureeMinutes) {
        this.dureeMinutes = dureeMinutes;
        this.updatedAt = LocalDateTime.now();
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
        this.updatedAt = LocalDateTime.now();
    }

    public String getGoogleEventId() {
        return googleEventId;
    }

    public void setGoogleEventId(String googleEventId) {
        this.googleEventId = googleEventId;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public String getPatientComplet() {
        return patientPrenom + " " + patientNom;
    }

    public boolean isConfirme() {
        return statut == StatutRDV.CONFIRME;
    }

    public boolean isAnnule() {
        return statut == StatutRDV.ANNULE;
    }

    public boolean hasGoogleEvent() {
        return googleEventId != null && !googleEventId.isEmpty();
    }
}
