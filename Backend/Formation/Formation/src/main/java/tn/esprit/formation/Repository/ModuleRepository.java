package tn.esprit.formation.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.formation.Entity.Module;

import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByProgrammeFormationId(Long programmeId);
    List<Module> findByType(String type);
}
