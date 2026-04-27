package tn.esprit.user.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import tn.esprit.user.Config.RabbitMQConfig;
import tn.esprit.user.DTO.LoginEventDTO;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publish(LoginEventDTO event) {
        log.info(">>> Publishing login event to RabbitMQ: userId={}, email={}",
                event.getUserId(), event.getEmail());

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.ROUTING_KEY,
                event
        );

        log.info(">>> Login event published successfully for user: {}", event.getEmail());
    }
}
