package tn.esprit.sensorsimulator.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.sensorsimulator.Entity.AbnormalEvent;
import tn.esprit.sensorsimulator.Entity.AbnormalEventType;

import java.util.List;

@Repository
public interface AbnormalEventRepository extends JpaRepository<AbnormalEvent, Long> {

    List<AbnormalEvent> findByPatientIdOrderByDetectedAtDesc(Long patientId);

    List<AbnormalEvent> findByEventType(AbnormalEventType eventType);

    List<AbnormalEvent> findByAlertSentFalse();

    long countByPatientId(Long patientId);
}
