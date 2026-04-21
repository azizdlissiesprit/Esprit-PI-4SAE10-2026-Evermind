package tn.esprit.conversation.DTO;

import java.time.LocalDateTime;

public class ConversationDTO {
    private Long id;
    private UserDTO otherParticipant;
    private LocalDateTime lastUpdated;
    private String lastMessagePreview;

    public ConversationDTO() {}

    public ConversationDTO(Long id, UserDTO otherParticipant, LocalDateTime lastUpdated, String lastMessagePreview) {
        this.id = id;
        this.otherParticipant = otherParticipant;
        this.lastUpdated = lastUpdated;
        this.lastMessagePreview = lastMessagePreview;
    }

    public static ConversationDTOBuilder builder() {
        return new ConversationDTOBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserDTO getOtherParticipant() { return otherParticipant; }
    public void setOtherParticipant(UserDTO otherParticipant) { this.otherParticipant = otherParticipant; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    public String getLastMessagePreview() { return lastMessagePreview; }
    public void setLastMessagePreview(String lastMessagePreview) { this.lastMessagePreview = lastMessagePreview; }

    public static class ConversationDTOBuilder {
        private Long id;
        private UserDTO otherParticipant;
        private LocalDateTime lastUpdated;
        private String lastMessagePreview;

        public ConversationDTOBuilder id(Long id) { this.id = id; return this; }
        public ConversationDTOBuilder otherParticipant(UserDTO otherParticipant) { this.otherParticipant = otherParticipant; return this; }
        public ConversationDTOBuilder lastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; return this; }
        public ConversationDTOBuilder lastMessagePreview(String lastMessagePreview) { this.lastMessagePreview = lastMessagePreview; return this; }
        public ConversationDTO build() { return new ConversationDTO(id, otherParticipant, lastUpdated, lastMessagePreview); }
    }
}
