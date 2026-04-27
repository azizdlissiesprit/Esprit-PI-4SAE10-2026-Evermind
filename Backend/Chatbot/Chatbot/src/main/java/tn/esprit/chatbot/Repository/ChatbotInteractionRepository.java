package tn.esprit.chatbot.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.chatbot.Entity.ChatbotInteraction;

import java.util.List;

public interface ChatbotInteractionRepository extends JpaRepository<ChatbotInteraction, Long> {

    List<ChatbotInteraction> findByUserIdOrderByTimestampDesc(Long userId);

    List<ChatbotInteraction> findTop20ByUserIdOrderByTimestampDesc(Long userId);

    void deleteByUserId(Long userId);
}
