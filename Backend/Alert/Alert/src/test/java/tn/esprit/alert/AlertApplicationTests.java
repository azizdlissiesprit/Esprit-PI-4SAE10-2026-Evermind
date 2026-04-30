package tn.esprit.alert;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AlertApplicationTests {

    @Test
    @Disabled("Disabled for CI/CD - Requires active Database and RabbitMQ")
    void contextLoads() {
    }

}
