package tn.esprit.formation.Repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.esprit.formation.Entity.Inscription;
import tn.esprit.formation.DTO.FormationStatDTO;

import java.util.List;

@Repository
public interface InscriptionRepository extends JpaRepository<Inscription, Long> {

    @Query("SELECT new tn.esprit.formation.DTO.FormationStatDTO(i.programmeFormation.titre, COUNT(i)) " +
           "FROM Inscription i " +
           "GROUP BY i.programmeFormation.titre " +
           "ORDER BY COUNT(i) DESC")
    List<FormationStatDTO> findTopFormations(Pageable pageable);

    @Query("SELECT (SUM(CASE WHEN i.statut = tn.esprit.formation.Entity.StatutInscription.REUSSIE THEN 1.0 ELSE 0.0 END) / COUNT(i)) * 100 " +
           "FROM Inscription i " +
           "WHERE i.statut <> tn.esprit.formation.Entity.StatutInscription.EN_COURS")
    Double calculateGlobalSuccessRate();
}
