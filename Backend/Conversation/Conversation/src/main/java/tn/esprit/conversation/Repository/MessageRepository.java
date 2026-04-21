package tn.esprit.conversation.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.conversation.Entity.Message;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderByTimestampAsc(Long conversationId);
    Optional<Message> findFirstByConversationIdOrderByTimestampDesc(Long conversationId);
    List<Message> findByConversationIdAndSenderIdNotAndIsReadFalse(Long conversationId, Long senderId);
}
