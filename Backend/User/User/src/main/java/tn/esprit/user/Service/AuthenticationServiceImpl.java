package tn.esprit.user.Service;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.user.Config.JwtUtils;
import tn.esprit.user.DTO.AuthenticationResponse;
import tn.esprit.user.DTO.FaceServiceVerifyResponse;
import tn.esprit.user.DTO.ForgotPasswordRequest;
import tn.esprit.user.DTO.LoginRequest;
import tn.esprit.user.DTO.RegisterRequest;
import tn.esprit.user.DTO.ResetPasswordRequest;
import tn.esprit.user.Entity.User;
import tn.esprit.user.Repository.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements IAuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final IEmailService emailService;
    private final IFaceServiceClient faceServiceClient;

    @Override
    public AuthenticationResponse register(RegisterRequest request) {
        User user = createUser(request);
        return buildAuthResponse(user, null);
    }

    @Override
    @Transactional
    public AuthenticationResponse registerWithFace(RegisterRequest request, MultipartFile faceImage) {
        User user = createUser(request);
        try {
            faceServiceClient.enroll(user, faceImage);
            user.setFaceEnabled(true);
            repository.save(user);
            return buildAuthResponse(user, null);
        } catch (RuntimeException exception) {
            repository.delete(user);
            throw exception;
        }
    }

    private User createUser(RegisterRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        // 1. Generate a random verification code
        String verificationCode = UUID.randomUUID().toString();

        // 2. Create the user (INACTIVE by default)
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .userType(request.getUserType())
                .active(false) // User cannot login yet
                .verificationCode(verificationCode) // Save the code
                .build();

        user = repository.save(user);

        // 3. Send the verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), verificationCode);
        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send verification email");
        }

        return user;
    }

    @Override
    public AuthenticationResponse authenticate(LoginRequest request) {
        User user = validateUserCredentials(request);
        var jwtToken = jwtUtils.generateToken(user);
        return buildAuthResponse(user, jwtToken);
    }

    @Override
    public AuthenticationResponse authenticateWithFace(LoginRequest request, MultipartFile faceImage) {
        User user = validateUserForFaceAuthentication(request.getEmail());
        if (!Boolean.TRUE.equals(user.getFaceEnabled())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Face authentication is not enabled for this account");
        }

        FaceServiceVerifyResponse verification = faceServiceClient.verify(user, faceImage);
        if (!verification.isMatched()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Face verification failed");
        }

        var jwtToken = jwtUtils.generateToken(user);
        user.setLastLogin(LocalDateTime.now());
        repository.save(user);
        return buildAuthResponse(user, jwtToken);
    }

    private User validateUserForFaceAuthentication(String email) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown account"));

        if (Boolean.TRUE.equals(user.getBanned())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account has been suspended. Please contact support or an administrator."
            );
        }

        if (user.getActive() == null || !user.getActive()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Account not verified. Please check your email and verify your account."
            );
        }

        return user;
    }

    private User validateUserCredentials(LoginRequest request) {
        // 1) Find user first (so we can check active status)
        User user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        // 2) Block login if banned
        if (Boolean.TRUE.equals(user.getBanned())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account has been suspended. Please contact support or an administrator."
            );
        }

        // 3) Block login if not verified/active
        // (active=false means the user must verify via /auth/verify?code=...)
        if (user.getActive() == null || !user.getActive()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Account not verified. Please check your email and verify your account."
            );
        }

        // 4) Authenticate password (wrong password -> 401)
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        user.setLastLogin(LocalDateTime.now());
        repository.save(user);
        return user;
    }

    public boolean verifyUser(String verificationCode) {
        var userOptional = repository.findByVerificationCode(verificationCode);

        if (userOptional.isPresent()) {
            var user = userOptional.get();

            // Activate the account
            user.setActive(true);

            // Remove the verification code
            user.setVerificationCode(null);

            repository.save(user);
            return true;
        }

        return false;
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1)); // Token valid for 1 hour

        repository.save(user);

        // Send reset password email
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), resetToken);
        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        var user = repository.findByResetToken(request.getToken())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        // Check if token is expired
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token has expired");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        repository.save(user);
    }

    private AuthenticationResponse buildAuthResponse(User user, String token) {
        return AuthenticationResponse.builder()
                .token(token)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getUserType())
                .faceEnabled(user.getFaceEnabled())
                .build();
    }
}
