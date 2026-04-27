package tn.esprit.conversation.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Conversation conversation;

    private Long senderId;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime timestamp;

    private boolean isRead;

    public Message() {}

    public Message(Long id, Conversation conversation, Long senderId, String content, LocalDateTime timestamp, boolean isRead) {
        this.id = id;
        this.conversation = conversation;
        this.senderId = senderId;
        this.content = content;
        this.timestamp = timestamp;
        this.isRead = isRead;
    }

    public static MessageBuilder builder() {
        return new MessageBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Conversation getConversation() { return conversation; }
    public void setConversation(Conversation conversation) { this.conversation = conversation; }
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public static class MessageBuilder {
        private Long id;
        private Conversation conversation;
        private Long senderId;
        private String content;
        private LocalDateTime timestamp;
        private boolean isRead;

        public MessageBuilder id(Long id) { this.id = id; return this; }
        public MessageBuilder conversation(Conversation conversation) { this.conversation = conversation; return this; }
        public MessageBuilder senderId(Long senderId) { this.senderId = senderId; return this; }
        public MessageBuilder content(String content) { this.content = content; return this; }
        public MessageBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public MessageBuilder isRead(boolean isRead) { this.isRead = isRead; return this; }
        public Message build() { return new Message(id, conversation, senderId, content, timestamp, isRead); }
    }
}
