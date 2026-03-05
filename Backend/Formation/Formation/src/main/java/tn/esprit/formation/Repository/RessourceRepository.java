package tn.esprit.formation.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.formation.Entity.Ressource;

import java.util.List;

public interface RessourceRepository extends JpaRepository<Ressource, Long> {
    List<Ressource> findByModuleId(Long moduleId);
}
