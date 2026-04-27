package tn.esprit.patient.Service;

import tn.esprit.patient.Entity.MedicalReport;

import java.util.List;

public interface IMedicalReportService {
    MedicalReport create(MedicalReport report);
    List<MedicalReport> getByPatientId(Long patientId);
}
