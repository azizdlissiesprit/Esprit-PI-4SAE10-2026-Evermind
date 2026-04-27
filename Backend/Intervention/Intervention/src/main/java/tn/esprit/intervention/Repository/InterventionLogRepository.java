package tn.esprit.intervention.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.intervention.Entity.InterventionLog;

import java.util.List;

@Repository
public interface InterventionLogRepository extends JpaRepository<InterventionLog, Long> {
    List<InterventionLog> findByInterventionIdOrderByTimestampAsc(Long interventionId);
}
