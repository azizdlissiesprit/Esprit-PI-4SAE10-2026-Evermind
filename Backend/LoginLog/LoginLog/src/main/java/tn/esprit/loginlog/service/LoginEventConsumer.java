package tn.esprit.loginlog.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import tn.esprit.loginlog.config.RabbitMQConfig;
import tn.esprit.loginlog.dto.LoginEventDTO;
import tn.esprit.loginlog.entity.LoginHistory;
import tn.esprit.loginlog.repository.LoginHistoryRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginEventConsumer {

    private final LoginHistoryRepository loginHistoryRepository;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void consumeLoginEvent(LoginEventDTO event) {
        log.info(">>> Received login event: userId={}, email={}, role={}",
                event.getUserId(), event.getEmail(), event.getRole());

        LoginHistory record = LoginHistory.builder()
                .userId(event.getUserId())
                .email(event.getEmail())
                .role(event.getRole())
                .loginTime(event.getLoginTime())
                .build();

        loginHistoryRepository.save(record);

        log.info(">>> Login event saved to database for user: {}", event.getEmail());
    }
}
