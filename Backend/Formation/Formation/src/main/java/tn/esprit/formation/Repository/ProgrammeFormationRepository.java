package tn.esprit.formation.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.formation.Entity.ProgrammeFormation;

import java.util.List;

public interface ProgrammeFormationRepository extends JpaRepository<ProgrammeFormation, Long> {
    List<ProgrammeFormation> findByTheme(String theme);
}
