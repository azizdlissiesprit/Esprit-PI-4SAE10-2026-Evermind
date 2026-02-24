package tn.esprit.user.Service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.user.Entity.User;
import tn.esprit.user.Repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;


@Service
@AllArgsConstructor
public class UserServiceImpl implements IUserService{
    UserRepository userRepository;
    private PasswordEncoder passwordEncoder;


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
    };
}
