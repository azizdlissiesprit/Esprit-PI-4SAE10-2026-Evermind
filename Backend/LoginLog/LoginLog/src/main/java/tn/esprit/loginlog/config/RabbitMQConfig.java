package tn.esprit.loginlog.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.DefaultClassMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tn.esprit.loginlog.dto.LoginEventDTO;

import java.util.Map;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "login.exchange";
    public static final String QUEUE_NAME = "login.queue";
    public static final String ROUTING_KEY = "login.routing-key";

    @Bean
    public DirectExchange loginExchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue loginQueue() {
        return QueueBuilder.durable(QUEUE_NAME).build();
    }

    @Bean
    public Binding loginBinding(Queue loginQueue, DirectExchange loginExchange) {
        return BindingBuilder.bind(loginQueue).to(loginExchange).with(ROUTING_KEY);
    }

    @Bean
    public DefaultClassMapper classMapper() {
        DefaultClassMapper classMapper = new DefaultClassMapper();
        // Map the publisher's DTO class name to this service's DTO class
        classMapper.setIdClassMapping(Map.of(
                "tn.esprit.user.DTO.LoginEventDTO", LoginEventDTO.class
        ));
        classMapper.setTrustedPackages("*");
        return classMapper;
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        converter.setClassMapper(classMapper());
        return converter;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
