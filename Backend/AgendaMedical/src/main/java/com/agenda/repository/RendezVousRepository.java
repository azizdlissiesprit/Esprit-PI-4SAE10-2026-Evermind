package com.agenda.repository;

import com.agenda.entity.RendezVous;
import com.agenda.entity.RendezVous.StatutRDV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, Long> {

    List<RendezVous> findByDateHeureBetweenOrderByDateHeure(LocalDateTime debut, LocalDateTime fin);

    @Query("SELECT COUNT(r) FROM RendezVous r WHERE r.dateHeure BETWEEN :debut AND :fin")
    long countByPeriode(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("SELECT COUNT(r) FROM RendezVous r WHERE r.dateHeure BETWEEN :debut AND :fin AND r.statut = 'CONFIRME'")
    long countConfirmesByPeriode(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("SELECT COUNT(r) FROM RendezVous r WHERE r.dateHeure BETWEEN :debut AND :fin AND r.statut = 'ANNULE'")
    long countAnnulesByPeriode(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    List<RendezVous> findByPatientNomContainingIgnoreCaseOrPatientPrenomContainingIgnoreCase(String nom, String prenom);

    List<RendezVous> findByDateHeureBetween(LocalDateTime debut, LocalDateTime fin);
}
