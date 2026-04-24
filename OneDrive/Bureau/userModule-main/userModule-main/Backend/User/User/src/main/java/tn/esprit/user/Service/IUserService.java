package tn.esprit.user.Service;

import tn.esprit.user.DTO.UpdateUserRequest;
import tn.esprit.user.DTO.UserResponse;
import tn.esprit.user.DTO.UserStatsResponse;
import tn.esprit.user.Entity.User;
import tn.esprit.user.Entity.UserType;

import java.util.List;

public interface IUserService {

    User addUser(User user);
    void removeUser(Long userId);
    User login(String email, String rawPassword);
    List<User> retrieveAllUsers();
    User retrieveUser(Long userId);
    List<UserResponse> getUsers(String search, UserType userType, Boolean active);
    UserResponse getUserById(Long userId);
    UserResponse updateUser(Long userId, UpdateUserRequest request);
    UserResponse banUser(Long userId);
    UserResponse unbanUser(Long userId);
    void deleteUser(Long userId, String currentUserEmail);
    UserResponse getCurrentUser(String email);
    UserStatsResponse getUserStats();
}
