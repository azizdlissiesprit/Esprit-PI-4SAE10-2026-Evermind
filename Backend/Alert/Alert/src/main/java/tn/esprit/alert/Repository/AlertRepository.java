package tn.esprit.alert.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.alert.Entity.Alert;

public interface AlertRepository extends JpaRepository<Alert, Long> {
}
