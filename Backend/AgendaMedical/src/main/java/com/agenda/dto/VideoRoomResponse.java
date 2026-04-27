package com.agenda.dto;

public class VideoRoomResponse {
    private String roomUrl;
    private String roomName;
    private Long rendezVousId;

    public VideoRoomResponse() {}

    public VideoRoomResponse(String roomUrl, String roomName, Long rendezVousId) {
        this.roomUrl = roomUrl;
        this.roomName = roomName;
        this.rendezVousId = rendezVousId;
    }

    public String getRoomUrl() {
        return roomUrl;
    }

    public void setRoomUrl(String roomUrl) {
        this.roomUrl = roomUrl;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public Long getRendezVousId() {
        return rendezVousId;
    }

    public void setRendezVousId(Long rendezVousId) {
        this.rendezVousId = rendezVousId;
    }
}
