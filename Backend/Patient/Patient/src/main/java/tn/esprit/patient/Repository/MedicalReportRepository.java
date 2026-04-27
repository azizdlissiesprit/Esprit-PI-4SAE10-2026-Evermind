package tn.esprit.patient.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.patient.Entity.MedicalReport;

import java.util.List;

public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {
    List<MedicalReport> findByPatientIdOrderByReportDateDesc(Long patientId);
}
