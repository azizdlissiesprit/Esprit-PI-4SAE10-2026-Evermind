package tn.esprit.alert.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.alert.Entity.Alert;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findTop10ByPatientIdOrderByDateCreationDesc(Long patientId);
}
