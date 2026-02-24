package tn.esprit.user.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.user.DTO.AuthenticationResponse;
import tn.esprit.user.DTO.LoginRequest;
import tn.esprit.user.DTO.RegisterRequest;
import tn.esprit.user.Service.AuthenticationServiceImpl;
import tn.esprit.user.Service.IAuthenticationService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final IAuthenticationService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }
    @GetMapping("/verify")
    public ResponseEntity<String> verifyAccount(@RequestParam("code") String code) {
        boolean isVerified = ((AuthenticationServiceImpl) authService).verifyUser(code);

        if (isVerified) {
            return ResponseEntity.ok("Account verified successfully!");
        } else {
            return ResponseEntity.badRequest().body("Invalid verification code.");
        }
    }
}