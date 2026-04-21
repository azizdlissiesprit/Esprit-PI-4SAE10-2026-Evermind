package tn.esprit.user.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginEventDTO implements Serializable {

    private Long userId;
    private String email;
    private String role;
    private LocalDateTime loginTime;
}
