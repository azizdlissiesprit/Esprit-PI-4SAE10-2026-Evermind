package tn.esprit.intervention.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.intervention.Entity.Intervention;

import java.util.List;
import java.util.Optional;

public interface InterventionRepository extends JpaRepository<Intervention, Long> {
    Optional<Intervention> findByAlertId(Long alertId);
    List<Intervention> findByPatientId(Long patientId);
    List<Intervention> findByEscalatedToUserId(Long userId);

}
