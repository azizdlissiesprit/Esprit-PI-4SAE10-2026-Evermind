package tn.esprit.user.Service;

import jakarta.mail.MessagingException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.user.Config.JwtUtils;
import tn.esprit.user.DTO.AuthenticationResponse;
import tn.esprit.user.DTO.ForgotPasswordRequest;
import tn.esprit.user.DTO.LoginRequest;
import tn.esprit.user.DTO.RegisterRequest;
import tn.esprit.user.DTO.ResetPasswordRequest;
import tn.esprit.user.Entity.User;
import tn.esprit.user.Entity.UserType;
import tn.esprit.user.Repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceImplTest {

    @Mock
    private UserRepository repository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private IEmailService emailService;

    @InjectMocks
    private AuthenticationServiceImpl service;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .firstName("Jane")
                .lastName("Doe")
                .email("jane@example.com")
                .password("plain-password")
                .phoneNumber("12345678")
                .userType(UserType.ADMIN)
                .build();

        loginRequest = new LoginRequest();
        loginRequest.setEmail("jane@example.com");
        loginRequest.setPassword("plain-password");
    }

    @Test
    void registerShouldSaveInactiveUserAndSendVerificationEmail() throws MessagingException {
        when(passwordEncoder.encode("plain-password")).thenReturn("hashed-password");
        when(repository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doNothing().when(emailService).sendVerificationEmail(anyString(), anyString(), anyString());

        AuthenticationResponse response = service.register(registerRequest);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(repository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertEquals("Jane", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertEquals("jane@example.com", response.getEmail());
        assertNull(response.getToken());
        assertEquals("hashed-password", savedUser.getPasswordHash());
        assertFalse(savedUser.getActive());
        assertNotNull(savedUser.getVerificationCode());
        verify(emailService).sendVerificationEmail(
                "jane@example.com",
                "Jane",
                savedUser.getVerificationCode()
        );
    }

    @Test
    void authenticateShouldReturnJwtForActiveUser() {
        User user = User.builder()
                .email("jane@example.com")
                .firstName("Jane")
                .lastName("Doe")
                .passwordHash("hashed-password")
                .userType(UserType.ADMIN)
                .active(true)
                .build();

        when(repository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));
        when(jwtUtils.generateToken(user)).thenReturn("jwt-token");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("jane@example.com", "plain-password"));

        AuthenticationResponse response = service.authenticate(loginRequest);

        assertEquals("jwt-token", response.getToken());
        assertEquals("Jane", response.getFirstName());
        assertEquals(UserType.ADMIN, response.getRole());
    }

    @Test
    void authenticateShouldRejectInactiveUser() {
        User user = User.builder()
                .email("jane@example.com")
                .banned(false)
                .active(false)
                .build();

        when(repository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.authenticate(loginRequest)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void authenticateShouldRejectBannedUser() {
        User user = User.builder()
                .email("jane@example.com")
                .banned(true)
                .active(true)
                .build();

        when(repository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.authenticate(loginRequest)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertEquals("Your account has been suspended. Please contact support or an administrator.", exception.getReason());
    }

    @Test
    void authenticateShouldRejectInvalidPassword() {
        User user = User.builder()
                .email("jane@example.com")
                .banned(false)
                .active(true)
                .build();

        when(repository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("bad credentials"));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.authenticate(loginRequest)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    void verifyUserShouldActivateAccountWhenCodeExists() {
        User user = User.builder()
                .email("jane@example.com")
                .verificationCode("verification-code")
                .active(false)
                .build();

        when(repository.findByVerificationCode("verification-code")).thenReturn(Optional.of(user));

        boolean verified = service.verifyUser("verification-code");

        assertTrue(verified);
        assertTrue(user.getActive());
        assertNull(user.getVerificationCode());
        verify(repository).save(user);
    }

    @Test
    void verifyUserShouldReturnFalseWhenCodeDoesNotExist() {
        when(repository.findByVerificationCode("missing-code")).thenReturn(Optional.empty());

        boolean verified = service.verifyUser("missing-code");

        assertFalse(verified);
    }

    @Test
    void forgotPasswordShouldGenerateTokenAndSendEmail() throws MessagingException {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("jane@example.com");

        User user = User.builder()
                .email("jane@example.com")
                .firstName("Jane")
                .build();

        when(repository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));
        when(repository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doNothing().when(emailService).sendPasswordResetEmail(anyString(), anyString(), anyString());

        service.forgotPassword(request);

        assertNotNull(user.getResetToken());
        assertNotNull(user.getResetTokenExpiry());
        assertTrue(user.getResetTokenExpiry().isAfter(LocalDateTime.now()));
        verify(emailService).sendPasswordResetEmail("jane@example.com", "Jane", user.getResetToken());
    }

    @Test
    void resetPasswordShouldUpdatePasswordAndClearResetFields() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("reset-token");
        request.setNewPassword("new-password");

        User user = User.builder()
                .resetToken("reset-token")
                .resetTokenExpiry(LocalDateTime.now().plusMinutes(30))
                .passwordHash("old-password")
                .build();

        when(repository.findByResetToken("reset-token")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("new-password")).thenReturn("new-hashed-password");

        service.resetPassword(request);

        assertEquals("new-hashed-password", user.getPasswordHash());
        assertNull(user.getResetToken());
        assertNull(user.getResetTokenExpiry());
        verify(repository).save(user);
    }

    @Test
    void resetPasswordShouldRejectExpiredToken() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("expired-token");
        request.setNewPassword("new-password");

        User user = User.builder()
                .resetToken("expired-token")
                .resetTokenExpiry(LocalDateTime.now().minusMinutes(1))
                .build();

        when(repository.findByResetToken("expired-token")).thenReturn(Optional.of(user));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.resetPassword(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }
}
