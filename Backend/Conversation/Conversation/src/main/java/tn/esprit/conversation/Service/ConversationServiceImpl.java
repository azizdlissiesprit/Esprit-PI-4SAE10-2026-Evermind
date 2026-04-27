package tn.esprit.conversation.Service;

import org.springframework.stereotype.Service;
import tn.esprit.conversation.Client.UserClient;
import tn.esprit.conversation.DTO.ConversationDTO;
import tn.esprit.conversation.DTO.UserDTO;
import tn.esprit.conversation.Entity.Conversation;
import tn.esprit.conversation.Entity.Message;
import tn.esprit.conversation.Repository.ConversationRepository;
import tn.esprit.conversation.Repository.MessageRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConversationServiceImpl implements IConversationService {

    private final ConversationRepository conversationRepository;
    private final UserClient userClient;
    private final MessageRepository messageRepository;

    public ConversationServiceImpl(ConversationRepository conversationRepository, UserClient userClient, MessageRepository messageRepository) {
        this.conversationRepository = conversationRepository;
        this.userClient = userClient;
        this.messageRepository = messageRepository;
    }

    @Override
    public List<ConversationDTO> getConversationsByUser(Long userId) {
        System.out.println("Processing getConversationsByUser for ID: " + userId);
        try {
            List<Conversation> conversations = conversationRepository.findConversationsByUser(userId);
            System.out.println("Found " + conversations.size() + " conversations in DB");
            
            return conversations.stream().map(conv -> {
                try {
                    Long u1 = conv.getUser1Id();
                    Long u2 = conv.getUser2Id();
                    
                    if (u1 == null || u2 == null) {
                        System.out.println("Warning: Conversation " + conv.getId() + " has null user IDs");
                        return null;
                    }

                    Long otherParticipantId = u1.equals(userId) ? u2 : u1;
                    System.out.println("Fetching user details for other participant: " + otherParticipantId);
                    
                    UserDTO otherParticipant = null;
                    try {
                        otherParticipant = userClient.getUserById(otherParticipantId);
                    } catch (Exception e) {
                        System.out.println("Error calling User service for ID " + otherParticipantId + ": " + e.getMessage());
                        // Create a placeholder if user service fails
                        otherParticipant = new UserDTO(otherParticipantId, "Deleted", "User", "N/A", "N/A");
                    }
                    
                    Optional<Message> lastMessage = messageRepository.findFirstByConversationIdOrderByTimestampDesc(conv.getId());
                    String preview = lastMessage.map(Message::getContent).orElse("No messages yet");
                    
                    return ConversationDTO.builder()
                            .id(conv.getId())
                            .otherParticipant(otherParticipant)
                            .lastUpdated(conv.getLastUpdated() != null ? conv.getLastUpdated() : LocalDateTime.now())
                            .lastMessagePreview(preview)
                            .build();
                } catch (Exception e) {
                    System.out.println("Error processing conversation entry: " + e.getMessage());
                    return null;
                }
            })
            .filter(java.util.Objects::nonNull)
            .collect(Collectors.toList());
        } catch (Exception e) {
            System.out.println("Critical error in getConversationsByUser: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw to maintain 500 but with logs
        }
    }

    @Override
    public Conversation getOrCreateConversation(Long user1Id, Long user2Id) {
        System.out.println("getOrCreateConversation between " + user1Id + " and " + user2Id);
        try {
            Optional<Conversation> existing = conversationRepository.findExistingConversation(user1Id, user2Id);
            
            if (existing.isPresent()) {
                System.out.println("Returning existing conversation: " + existing.get().getId());
                return existing.get();
            }

            System.out.println("Creating new conversation...");
            Conversation newConv = Conversation.builder()
                    .user1Id(user1Id)
                    .user2Id(user2Id)
                    .lastUpdated(LocalDateTime.now())
                    .build();
                    
            Conversation saved = conversationRepository.save(newConv);
            System.out.println("Saved new conversation with ID: " + saved.getId());
            return saved;
        } catch (Exception e) {
            System.out.println("Error in getOrCreateConversation: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
