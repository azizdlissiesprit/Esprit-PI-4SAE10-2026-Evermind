package tn.esprit.conversation.Service;

import tn.esprit.conversation.DTO.SendMessageDTO;
import tn.esprit.conversation.Entity.Message;

import java.util.List;

public interface IMessageService {
    List<Message> getMessagesByConversation(Long conversationId);
    Message sendMessage(SendMessageDTO dto);
    void markAsRead(Long conversationId, Long readerId);
}
