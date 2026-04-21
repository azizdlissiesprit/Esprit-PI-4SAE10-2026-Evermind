package tn.esprit.conversation.Controller;

import org.springframework.web.bind.annotation.*;
import tn.esprit.conversation.DTO.ConversationDTO;
import tn.esprit.conversation.Service.IConversationService;

import java.util.List;

@RestController
@RequestMapping("/conversation")
public class ConversationController {

    private final IConversationService conversationService;

    public ConversationController(IConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @GetMapping("/user/{userId}")
    public List<ConversationDTO> getConversationsByUser(@PathVariable("userId") Long userId) {
        return conversationService.getConversationsByUser(userId);
    }
}
