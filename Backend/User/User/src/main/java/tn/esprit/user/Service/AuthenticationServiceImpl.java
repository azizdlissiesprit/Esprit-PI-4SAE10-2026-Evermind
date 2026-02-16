package tn.esprit.user.Service;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.user.Config.JwtUtils;
import tn.esprit.user.DTO.AuthenticationResponse;
import tn.esprit.user.DTO.LoginRequest;
import tn.esprit.user.DTO.RegisterRequest;
import tn.esprit.user.Entity.User;
import tn.esprit.user.Repository.UserRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements IAuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final IEmailService emailService;

    @Override
    public AuthenticationResponse register(RegisterRequest request) {
        // 1. Generate a random verification code
        String verificationCode = UUID.randomUUID().toString();

        // 2. Create the user (INACTIVE by default)
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .userType(request.getUserType())
                .active(false) // <--- CHANGED: User cannot login yet
                .verificationCode(verificationCode) // <--- SAVE THE CODE
                .build();

        repository.save(user);

        // 3. Send the verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), verificationCode);
        } catch (MessagingException e) {
            e.printStackTrace();
            // Optional: You might want to delete the user if email fails so they can try again
            throw new RuntimeException("Failed to send verification email");
        }

        // 4. Return response WITHOUT token (User must verify first)
        return AuthenticationResponse.builder()
                .token(null) // <--- CHANGED: No token provided yet
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getUserType())
                .build();
    }

    @Override
    public AuthenticationResponse authenticate(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var user = repository.findByEmail(request.getEmail()).orElseThrow();

        // --- FIX IS HERE ---
        // Pass the String email, not the object
        var jwtToken = jwtUtils.generateToken(user.getEmail());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getUserType())
                .build();
    }

    public boolean verifyUser(String verificationCode) {
        // 1. Find the user by the verification code
        // Note: You must have findByVerificationCode in UserRepository
        var userOptional = repository.findByVerificationCode(verificationCode);

        if (userOptional.isPresent()) {
            var user = userOptional.get();

            // 2. Activate the account
            user.setActive(true);

            // 3. Remove the verification code (so it can't be used again)
            user.setVerificationCode(null);

            // 4. Save the changes
            repository.save(user);

            return true; // Verification successful
        }

        return false; // Verification failed (code not found)
    }
}