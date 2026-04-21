package tn.esprit.conversation.Controller;

import org.springframework.web.bind.annotation.*;
import tn.esprit.conversation.DTO.SendMessageDTO;
import tn.esprit.conversation.Entity.Message;
import tn.esprit.conversation.Service.IMessageService;

import java.util.List;

@RestController
@RequestMapping("/message")
public class MessageController {

    private final IMessageService messageService;

    public MessageController(IMessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/conversation/{conversationId}")
    public List<Message> getMessagesByConversation(@PathVariable("conversationId") Long conversationId) {
        return messageService.getMessagesByConversation(conversationId);
    }

    @PostMapping("/send")
    public Message sendMessage(@RequestBody SendMessageDTO dto) {
        return messageService.sendMessage(dto);
    }

    @PutMapping("/mark-as-read/{conversationId}/{readerId}")
    public void markAsRead(@PathVariable("conversationId") Long conversationId, @PathVariable("readerId") Long readerId) {
        messageService.markAsRead(conversationId, readerId);
    }
}
