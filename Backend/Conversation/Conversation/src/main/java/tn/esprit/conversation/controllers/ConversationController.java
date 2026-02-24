package tn.esprit.conversation.controllers;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.conversation.Entities.Conversation;
import tn.esprit.conversation.services.IConversationService;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/Conversation")
public class ConversationController {
    @Autowired
    IConversationService conversationService;
    @GetMapping("/retrieve-all-Conversations")
    List<Conversation> getConversations() {
        List<Conversation> conversations= conversationService.retrieveAllConversations();
        return conversations;
    }
    @PostMapping("/add-conversation")
    Conversation addCovnersation(@RequestBody Conversation covnersation ) {
        Conversation newCovnersation = conversationService.addConversation(covnersation );
        return newCovnersation ;
    }
    @DeleteMapping("/remove-conversation/{conversation-id}")
    public void removeConversation(@PathVariable("conversation-id") Long cnId) {
        conversationService.removeConversation(cnId);
    }

    @GetMapping("/retrieve-Conversation/{conversation-id}")
    Conversation retrieveConversation(@PathVariable("conversation-id") Long cnId) {
        return conversationService.retrieveConversation(cnId);

    }
}
