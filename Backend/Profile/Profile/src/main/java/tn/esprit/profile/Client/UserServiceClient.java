package tn.esprit.profile.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.profile.Dto.UserVo;

// "USER-SERVICE" must match the spring.application.name in User Service
// url is optional if using Eureka, but good for direct testing
@FeignClient(name = "USER-SERVICE", url = "http://localhost:8082")
public interface UserServiceClient {

    @GetMapping("/user/internal/{id}")
    UserVo getUserById(@PathVariable("id") Long id);
}