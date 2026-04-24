package tn.esprit.user.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;
import tn.esprit.user.DTO.ForgotPasswordRequest;
import tn.esprit.user.DTO.LoginRequest;
import tn.esprit.user.DTO.RegisterRequest;
import tn.esprit.user.DTO.AuthenticationResponse;
import tn.esprit.user.DTO.ResetPasswordRequest;
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

    @PostMapping(value = "/register-with-face", consumes = "multipart/form-data")
    public ResponseEntity<AuthenticationResponse> registerWithFace(
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String phoneNumber,
            @RequestParam tn.esprit.user.Entity.UserType userType,
            @RequestPart("faceImage") MultipartFile faceImage
    ) {
        RegisterRequest request = RegisterRequest.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(password)
                .phoneNumber(phoneNumber)
                .userType(userType)
                .build();

        return ResponseEntity.ok(authService.registerWithFace(request, faceImage));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping(value = "/login-with-face", consumes = "multipart/form-data")
    public ResponseEntity<AuthenticationResponse> loginWithFace(
            @RequestParam String email,
            @RequestPart("faceImage") MultipartFile faceImage
    ) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        return ResponseEntity.ok(authService.authenticateWithFace(request, faceImage));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok("Password reset email sent successfully");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully");
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyAccount(@RequestParam("code") String code) {
        boolean verified = authService.verifyUser(code);
        if (verified) {
            return ResponseEntity.ok("Account verified successfully");
        }
        return ResponseEntity.badRequest().body("Invalid verification code");
    }
}
