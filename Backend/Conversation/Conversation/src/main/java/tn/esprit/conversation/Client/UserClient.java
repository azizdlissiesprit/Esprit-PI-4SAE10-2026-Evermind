package tn.esprit.conversation.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.conversation.DTO.UserDTO;

@FeignClient(name = "User", url = "http://localhost:8082")
public interface UserClient {
    @GetMapping("/user/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
}
