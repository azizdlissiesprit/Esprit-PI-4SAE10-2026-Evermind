package tn.esprit.conversation.Service;

import tn.esprit.conversation.DTO.ConversationDTO;
import tn.esprit.conversation.Entity.Conversation;
import java.util.List;

public interface IConversationService {
    List<ConversationDTO> getConversationsByUser(Long userId);
    Conversation getOrCreateConversation(Long user1Id, Long user2Id);
}
