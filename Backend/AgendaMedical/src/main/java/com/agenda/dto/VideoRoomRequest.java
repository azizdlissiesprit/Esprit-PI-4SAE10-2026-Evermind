package com.agenda.dto;

public class VideoRoomRequest {
    private Long rendezVousId;
    private String patientName;

    public VideoRoomRequest() {}

    public VideoRoomRequest(Long rendezVousId, String patientName) {
        this.rendezVousId = rendezVousId;
        this.patientName = patientName;
    }

    public Long getRendezVousId() {
        return rendezVousId;
    }

    public void setRendezVousId(Long rendezVousId) {
        this.rendezVousId = rendezVousId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }
}
