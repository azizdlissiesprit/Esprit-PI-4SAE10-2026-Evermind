package tn.esprit.conversation.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long user1Id;
    private Long user2Id;

    private LocalDateTime lastUpdated;

    public Conversation() {}

    public Conversation(Long id, Long user1Id, Long user2Id, LocalDateTime lastUpdated) {
        this.id = id;
        this.user1Id = user1Id;
        this.user2Id = user2Id;
        this.lastUpdated = lastUpdated;
    }

    public static ConversationBuilder builder() {
        return new ConversationBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUser1Id() { return user1Id; }
    public void setUser1Id(Long user1Id) { this.user1Id = user1Id; }
    public Long getUser2Id() { return user2Id; }
    public void setUser2Id(Long user2Id) { this.user2Id = user2Id; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public static class ConversationBuilder {
        private Long id;
        private Long user1Id;
        private Long user2Id;
        private LocalDateTime lastUpdated;

        public ConversationBuilder id(Long id) { this.id = id; return this; }
        public ConversationBuilder user1Id(Long user1Id) { this.user1Id = user1Id; return this; }
        public ConversationBuilder user2Id(Long user2Id) { this.user2Id = user2Id; return this; }
        public ConversationBuilder lastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; return this; }
        public Conversation build() { return new Conversation(id, user1Id, user2Id, lastUpdated); }
    }
}
