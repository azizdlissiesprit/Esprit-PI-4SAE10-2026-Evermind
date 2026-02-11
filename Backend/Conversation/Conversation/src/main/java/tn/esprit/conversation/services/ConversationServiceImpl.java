package tn.esprit.conversation.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.conversation.Entities.Conversation;
import tn.esprit.conversation.repositories.ConversationRepository;

import java.util.List;
@Service
@AllArgsConstructor

public class ConversationServiceImpl implements IConversationService
{
    public Conversation retrieveConversation(Long conversationId){
        return conversationRepository.findById(conversationId).get();
    };
    ConversationRepository conversationRepository;
    public List<Conversation> retrieveAllConversations() {return conversationRepository.findAll();}
    public Conversation addConversation(Conversation c){ return conversationRepository.save(c);}
    public void removeConversation(Long conversationId){conversationRepository.deleteById(conversationId);};
   // public Conversation addMessageToConversation( Long conversationId, Long messageId){ return conversationRepository.addMessageToConversation(conversationId ,  messageId);}
   public void removeConversationre(Long conversationId) {
       conversationRepository.deleteById(conversationId);

   }
}
