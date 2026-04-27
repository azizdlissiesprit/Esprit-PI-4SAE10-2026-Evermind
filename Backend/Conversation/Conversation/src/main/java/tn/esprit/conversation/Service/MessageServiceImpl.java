package tn.esprit.conversation.Service;

import org.springframework.stereotype.Service;
import tn.esprit.conversation.DTO.SendMessageDTO;
import tn.esprit.conversation.Entity.Conversation;
import tn.esprit.conversation.Entity.Message;
import tn.esprit.conversation.Repository.ConversationRepository;
import tn.esprit.conversation.Repository.MessageRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageServiceImpl implements IMessageService {

    private final MessageRepository messageRepository;
    private final IConversationService conversationService;
    private final ConversationRepository conversationRepository;

    public MessageServiceImpl(MessageRepository messageRepository, IConversationService conversationService, ConversationRepository conversationRepository) {
        this.messageRepository = messageRepository;
        this.conversationService = conversationService;
        this.conversationRepository = conversationRepository;
    }

    @Override
    public List<Message> getMessagesByConversation(Long conversationId) {
        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
    }

    @Override
    public Message sendMessage(SendMessageDTO dto) {
        System.out.println("Sending message from " + dto.getSenderId() + " to " + dto.getReceiverId());
        try {
            // Find or create the conversation thread between the two users
            Conversation conversation = conversationService.getOrCreateConversation(dto.getSenderId(), dto.getReceiverId());
            
            // Create the message
            Message message = Message.builder()
                    .conversation(conversation)
                    .senderId(dto.getSenderId())
                    .content(dto.getContent())
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            // Update the conversation's last updated timestamp
            conversation.setLastUpdated(LocalDateTime.now());
            conversationRepository.save(conversation);

            System.out.println("Saving message for conversation: " + conversation.getId());
            // Save and return the message
            return messageRepository.save(message);
        } catch (Exception e) {
            System.out.println("Error in sendMessage: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public void markAsRead(Long conversationId, Long readerId) {
        List<Message> unreadMessages = messageRepository.findByConversationIdAndSenderIdNotAndIsReadFalse(conversationId, readerId);
        unreadMessages.forEach(msg -> msg.setRead(true));
        messageRepository.saveAll(unreadMessages);
    }
}
