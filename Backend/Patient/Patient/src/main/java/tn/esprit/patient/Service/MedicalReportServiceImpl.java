package tn.esprit.patient.Service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.patient.Entity.MedicalReport;
import tn.esprit.patient.Repository.MedicalReportRepository;

import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class MedicalReportServiceImpl implements IMedicalReportService {

    private final MedicalReportRepository reportRepository;

    @Override
    public MedicalReport create(MedicalReport report) {
        log.info("📋 New Medical Report submitted for Patient ID: {} by Doctor: {}", 
                report.getPatientId(), report.getDoctorName());
        return reportRepository.save(report);
    }

    @Override
    public List<MedicalReport> getByPatientId(Long patientId) {
        return reportRepository.findByPatientIdOrderByReportDateDesc(patientId);
    }
}
