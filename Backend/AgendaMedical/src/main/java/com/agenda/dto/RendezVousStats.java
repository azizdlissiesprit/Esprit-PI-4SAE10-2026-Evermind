package com.agenda.dto;

public class RendezVousStats {
    private long totalJour;
    private long totalSemaine;
    private long confirmes;
    private long enAttente;
    private long annules;
    private double tauxConfirmation;

    // Constructors
    public RendezVousStats() {}

    public RendezVousStats(long totalJour, long totalSemaine, long confirmes, long enAttente, long annules) {
        this.totalJour = totalJour;
        this.totalSemaine = totalSemaine;
        this.confirmes = confirmes;
        this.enAttente = enAttente;
        this.annules = annules;
        this.tauxConfirmation = totalJour > 0 ? (double) confirmes / totalJour * 100 : 0;
    }

    // Getters and Setters
    public long getTotalJour() { return totalJour; }
    public void setTotalJour(long totalJour) { this.totalJour = totalJour; }

    public long getTotalSemaine() { return totalSemaine; }
    public void setTotalSemaine(long totalSemaine) { this.totalSemaine = totalSemaine; }

    public long getConfirmes() { return confirmes; }
    public void setConfirmes(long confirmes) { this.confirmes = confirmes; }

    public long getEnAttente() { return enAttente; }
    public void setEnAttente(long enAttente) { this.enAttente = enAttente; }

    public long getAnnules() { return annules; }
    public void setAnnules(long annules) { this.annules = annules; }

    public double getTauxConfirmation() { return tauxConfirmation; }
    public void setTauxConfirmation(double tauxConfirmation) { this.tauxConfirmation = tauxConfirmation; }
}
