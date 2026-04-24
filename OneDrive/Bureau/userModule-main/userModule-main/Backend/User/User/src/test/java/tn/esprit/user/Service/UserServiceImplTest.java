package tn.esprit.user.Service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.user.DTO.UpdateUserRequest;
import tn.esprit.user.DTO.UserResponse;
import tn.esprit.user.DTO.UserStatsResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import tn.esprit.user.Entity.User;
import tn.esprit.user.Entity.UserType;
import tn.esprit.user.Repository.UserRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl service;

    @Test
    void addUserShouldHashPasswordBeforeSaving() {
        User user = User.builder()
                .email("john@example.com")
                .passwordHash("plain-password")
                .userType(UserType.ADMIN)
                .build();

        when(passwordEncoder.encode("plain-password")).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User savedUser = service.addUser(user);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals("hashed-password", captor.getValue().getPasswordHash());
        assertEquals("hashed-password", savedUser.getPasswordHash());
    }

    @Test
    void removeUserShouldDeleteById() {
        service.removeUser(5L);

        verify(userRepository).deleteById(5L);
    }

    @Test
    void retrieveUserShouldReturnEntityWhenFound() {
        User user = User.builder().userId(1L).email("john@example.com").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = service.retrieveUser(1L);

        assertEquals(user, result);
    }

    @Test
    void retrieveUserShouldReturnNullWhenMissing() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        User result = service.retrieveUser(99L);

        assertNull(result);
    }

    @Test
    void loginShouldUpdateLastLoginWhenPasswordMatches() {
        User user = User.builder()
                .email("john@example.com")
                .passwordHash("hashed-password")
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("plain-password", "hashed-password")).thenReturn(true);
        when(userRepository.save(user)).thenReturn(user);

        User result = service.login("john@example.com", "plain-password");

        assertEquals(user, result);
        verify(userRepository).save(user);
    }

    @Test
    void loginShouldThrowWhenPasswordDoesNotMatch() {
        User user = User.builder()
                .email("john@example.com")
                .passwordHash("hashed-password")
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "hashed-password")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> service.login("john@example.com", "wrong-password"));
    }

    @Test
    void retrieveAllUsersShouldReturnRepositoryResults() {
        List<User> users = List.of(
                User.builder().userId(1L).email("a@example.com").build(),
                User.builder().userId(2L).email("b@example.com").build()
        );

        when(userRepository.findAll()).thenReturn(users);

        List<User> result = service.retrieveAllUsers();

        assertEquals(users, result);
    }

    @Test
    void getUsersShouldMapRepositoryResultsToResponses() {
        User user = User.builder()
                .userId(1L)
                .firstName("Jane")
                .lastName("Doe")
                .email("jane@example.com")
                .phoneNumber("12345678")
                .userType(UserType.ADMIN)
                .active(true)
                .build();

        when(userRepository.findByUserTypeAndActiveOrderByCreatedAtDesc(UserType.ADMIN, true))
                .thenReturn(List.of(user));

        List<UserResponse> responses = service.getUsers("jane", UserType.ADMIN, true);

        assertEquals(1, responses.size());
        assertEquals("jane@example.com", responses.get(0).getEmail());
        assertEquals(UserType.ADMIN, responses.get(0).getUserType());
        assertTrue(responses.get(0).getActive());
    }

    @Test
    void getUserByIdShouldReturnMappedResponse() {
        User user = User.builder()
                .userId(7L)
                .firstName("Ali")
                .lastName("Test")
                .email("ali@example.com")
                .userType(UserType.MEDECIN)
                .active(true)
                .build();

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));

        UserResponse response = service.getUserById(7L);

        assertEquals(7L, response.getUserId());
        assertEquals("ali@example.com", response.getEmail());
    }

    @Test
    void updateUserShouldUpdateEditableFields() {
        User user = User.builder()
                .userId(7L)
                .firstName("Old")
                .lastName("Name")
                .phoneNumber("111")
                .userType(UserType.AIDANT)
                .email("ali@example.com")
                .active(true)
                .build();

        UpdateUserRequest request = UpdateUserRequest.builder()
                .firstName("New")
                .lastName("Doctor")
                .phoneNumber("999")
                .userType(UserType.MEDECIN)
                .build();

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        UserResponse response = service.updateUser(7L, request);

        assertEquals("New", response.getFirstName());
        assertEquals("Doctor", response.getLastName());
        assertEquals("999", response.getPhoneNumber());
        assertEquals(UserType.MEDECIN, response.getUserType());
    }

    @Test
    void banUserShouldSetActiveFalse() {
        User user = User.builder()
                .userId(2L)
                .email("ban@example.com")
                .active(true)
                .banned(false)
                .build();

        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        UserResponse response = service.banUser(2L);

        assertTrue(response.getActive());
        assertTrue(user.getBanned());
    }

    @Test
    void unbanUserShouldSetActiveTrue() {
        User user = User.builder()
                .userId(2L)
                .email("ban@example.com")
                .active(true)
                .banned(true)
                .build();

        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        UserResponse response = service.unbanUser(2L);

        assertTrue(response.getActive());
        assertFalse(user.getBanned());
    }

    @Test
    void deleteUserShouldRejectDeletingCurrentAccount() {
        User user = User.builder()
                .userId(3L)
                .email("admin@example.com")
                .build();

        when(userRepository.findById(3L)).thenReturn(Optional.of(user));

        assertThrows(ResponseStatusException.class, () -> service.deleteUser(3L, "admin@example.com"));
    }

    @Test
    void getCurrentUserShouldReturnMappedResponse() {
        User user = User.builder()
                .userId(4L)
                .email("me@example.com")
                .firstName("Me")
                .lastName("User")
                .userType(UserType.RESPONSABLE)
                .active(true)
                .build();

        when(userRepository.findByEmail("me@example.com")).thenReturn(Optional.of(user));

        UserResponse response = service.getCurrentUser("me@example.com");

        assertEquals("Me", response.getFirstName());
        assertEquals(UserType.RESPONSABLE, response.getUserType());
    }

    @Test
    void getUserStatsShouldAggregateCounts() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByActive(true)).thenReturn(7L);
        when(userRepository.countByBanned(true)).thenReturn(3L);
        when(userRepository.countByUserType(UserType.ADMIN)).thenReturn(1L);
        when(userRepository.countByUserType(UserType.AIDANT)).thenReturn(4L);
        when(userRepository.countByUserType(UserType.MEDECIN)).thenReturn(3L);
        when(userRepository.countByUserType(UserType.RESPONSABLE)).thenReturn(2L);

        UserStatsResponse response = service.getUserStats();

        assertEquals(10L, response.getTotalUsers());
        assertEquals(7L, response.getActiveUsers());
        assertEquals(3L, response.getBannedUsers());
        assertEquals(4L, response.getAidants());
    }
}
