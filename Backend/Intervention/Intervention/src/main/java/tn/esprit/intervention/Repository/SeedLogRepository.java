package tn.esprit.intervention.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.intervention.Entity.SeedLog;

import java.util.List;

public interface SeedLogRepository extends JpaRepository<SeedLog, Long> {
    List<SeedLog> findByEntityType(String entityType);
    long countByEntityType(String entityType);
    void deleteByEntityType(String entityType);
}
