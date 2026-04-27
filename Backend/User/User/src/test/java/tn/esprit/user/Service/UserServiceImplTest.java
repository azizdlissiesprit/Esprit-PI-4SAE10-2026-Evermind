package tn.esprit.user.Service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import tn.esprit.user.Entity.User;
import tn.esprit.user.Entity.UserType;
import tn.esprit.user.Repository.UserRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .userId(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .passwordHash("rawPassword")
                .userType(UserType.AIDANT)
                .build();
    }

    @Test
    void addUser_ShouldHashPasswordAndSaveUser() {
        // Arrange
        String hashedPassword = "hashedPassword";
        when(passwordEncoder.encode("rawPassword")).thenReturn(hashedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User savedUser = userService.addUser(sampleUser);

        // Assert
        assertNotNull(savedUser);
        assertEquals(hashedPassword, savedUser.getPasswordHash());
        verify(passwordEncoder, times(1)).encode("rawPassword");
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    void login_WithValidCredentials_ShouldReturnUserAndUpdateLastLogin() {
        // Arrange
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("rawPassword", sampleUser.getPasswordHash())).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        // Act
        User loggedInUser = userService.login("john.doe@example.com", "rawPassword");

        // Assert
        assertNotNull(loggedInUser);
        assertNotNull(loggedInUser.getLastLogin());
        verify(userRepository, times(1)).findByEmail("john.doe@example.com");
        verify(passwordEncoder, times(1)).matches("rawPassword", sampleUser.getPasswordHash());
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    void login_WithInvalidEmail_ShouldThrowException() {
        // Arrange
        when(userRepository.findByEmail("wrong@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () ->
                userService.login("wrong@example.com", "anyPassword")
        );

        assertEquals("User not found", exception.getMessage());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void login_WithInvalidPassword_ShouldThrowException() {
        // Arrange
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongPassword", sampleUser.getPasswordHash())).thenReturn(false);

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () ->
                userService.login("john.doe@example.com", "wrongPassword")
        );

        assertEquals("Invalid credentials", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
}
