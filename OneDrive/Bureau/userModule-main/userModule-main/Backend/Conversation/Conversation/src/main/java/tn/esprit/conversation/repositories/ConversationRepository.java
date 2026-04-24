package tn.esprit.conversation.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import tn.esprit.conversation.Entities.Conversation;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
 //Conversation addMessageToConversation(@Param("cid") Long  conversationId, @Param("mid") Long  messageId );

}
