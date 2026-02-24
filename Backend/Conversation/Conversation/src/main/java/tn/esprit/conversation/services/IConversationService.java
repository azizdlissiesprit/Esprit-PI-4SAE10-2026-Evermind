package tn.esprit.conversation.services;

import tn.esprit.conversation.Entities.Conversation;

import java.util.List;

public interface IConversationService {
    public List<Conversation> retrieveAllConversations();
    public Conversation addConversation(Conversation c);
    public void removeConversation(Long conversationId);
    //public Conversation addMessageToConversation(Long conversationId, Long messageId);
    public void removeConversationre(Long conversationId);
    public Conversation retrieveConversation(Long conversationId);

    }
