package tn.esprit.sensorsimulator.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.sensorsimulator.Entity.SeedLog;

import java.util.List;

public interface SeedLogRepository extends JpaRepository<SeedLog, Long> {
    List<SeedLog> findByEntityType(String entityType);
    long countByEntityType(String entityType);
    void deleteByEntityType(String entityType);
}
