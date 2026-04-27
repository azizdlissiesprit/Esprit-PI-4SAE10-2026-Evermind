package tn.esprit.user.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import tn.esprit.user.DTO.UpdateUserRequest;
import tn.esprit.user.DTO.UserResponse;
import tn.esprit.user.DTO.UserStatsResponse;
import tn.esprit.user.Entity.User;
import tn.esprit.user.Entity.UserType;
import tn.esprit.user.Repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Objects;
import java.util.Locale;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService{
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public User addUser(User user) {
        // 1. Get the plain text password from the incoming object
        String plainPassword = user.getPasswordHash();

        // 2. Hash the password
        String hashedPassword = passwordEncoder.encode(plainPassword);

        // 3. Set the hashed password back to the user object
        user.setPasswordHash(hashedPassword);

        // 4. Save to database
        return userRepository.save(user);
    }


    public void removeUser(Long userId){
        userRepository.deleteById(userId);
    };

    public User retrieveUser(Long userId){

        User user = userRepository.findById(userId).orElse(null);
        return user;

    };

    // Add this method to UserServiceImpl
    public User login(String email, String rawPassword) {
        // 1. Find user by email
        // Note: You need to add findByEmail to your UserRepository interface first
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Compare the raw password with the stored hash
        boolean isPasswordMatch = passwordEncoder.matches(rawPassword, user.getPasswordHash());

        if (isPasswordMatch) {
            // Update last login time
            user.setLastLogin(java.time.LocalDateTime.now());
            return userRepository.save(user);
        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }
    public List<User> retrieveAllUsers(){
        return userRepository.findAll();
    }

    @Override
    public List<UserResponse> getUsers(String search, UserType userType, Boolean active) {
        String normalizedSearch = search == null || search.isBlank()
                ? null
                : search.trim().toLowerCase(Locale.ROOT);

        List<User> users = fetchUsers(userType, active);

        return users.stream()
                .filter(user -> matchesSearch(user, normalizedSearch))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public UserResponse getUserById(Long userId) {
        return mapToResponse(findExistingUser(userId));
    }

    @Override
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = findExistingUser(userId);

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getUserType() != null) {
            user.setUserType(request.getUserType());
        }

        return mapToResponse(userRepository.save(user));
    }

    @Override
    public UserResponse banUser(Long userId) {
        return updateActiveStatus(userId, false);
    }

    @Override
    public UserResponse unbanUser(Long userId) {
        return updateActiveStatus(userId, true);
    }

    @Override
    public void deleteUser(Long userId, String currentUserEmail) {
        User user = findExistingUser(userId);
        if (currentUserEmail != null && currentUserEmail.equalsIgnoreCase(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete your own account");
        }
        userRepository.delete(user);
    }

    @Override
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return mapToResponse(user);
    }

    @Override
    public UserStatsResponse getUserStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActive(true);
        long bannedUsers = userRepository.countByBanned(true);

        return UserStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .bannedUsers(bannedUsers)
                .admins(userRepository.countByUserType(UserType.ADMIN))
                .aidants(userRepository.countByUserType(UserType.AIDANT))
                .medecins(userRepository.countByUserType(UserType.MEDECIN))
                .responsables(userRepository.countByUserType(UserType.RESPONSABLE))
                .build();
    }

    private User findExistingUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserResponse updateActiveStatus(Long userId, boolean active) {
        User user = findExistingUser(userId);
        user.setBanned(!active);
        return mapToResponse(userRepository.save(user));
    }

    private List<User> fetchUsers(UserType userType, Boolean active) {
        if (userType != null && active != null) {
            return userRepository.findByUserTypeAndActiveOrderByCreatedAtDesc(userType, active);
        }
        if (userType != null) {
            return userRepository.findByUserTypeOrderByCreatedAtDesc(userType);
        }
        if (active != null) {
            return userRepository.findByActiveOrderByCreatedAtDesc(active);
        }
        return userRepository.findAllByOrderByCreatedAtDesc();
    }

    private boolean matchesSearch(User user, String normalizedSearch) {
        if (normalizedSearch == null) {
            return true;
        }
        return containsIgnoreCase(user.getFirstName(), normalizedSearch)
                || containsIgnoreCase(user.getLastName(), normalizedSearch)
                || containsIgnoreCase(user.getEmail(), normalizedSearch);
    }

    private boolean containsIgnoreCase(String value, String normalizedSearch) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(normalizedSearch);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .userType(user.getUserType())
                .active(Objects.requireNonNullElse(user.getActive(), false))
                .banned(Objects.requireNonNullElse(user.getBanned(), false))
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .build();
    }
}
