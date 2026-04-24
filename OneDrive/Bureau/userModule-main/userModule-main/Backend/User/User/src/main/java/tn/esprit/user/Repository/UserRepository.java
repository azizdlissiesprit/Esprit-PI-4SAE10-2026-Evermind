package tn.esprit.user.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.user.Entity.User;
import tn.esprit.user.Entity.UserType;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    // Optional: Useful for registration to check if email is already taken
    boolean existsByEmail(String email);
    Optional<User> findByVerificationCode(String verificationCode);
    Optional<User> findByResetToken(String resetToken);
    long countByActive(Boolean active);
    long countByBanned(Boolean banned);
    long countByUserType(UserType userType);
    List<User> findAllByOrderByCreatedAtDesc();
    List<User> findByUserTypeOrderByCreatedAtDesc(UserType userType);
    List<User> findByActiveOrderByCreatedAtDesc(Boolean active);
    List<User> findByUserTypeAndActiveOrderByCreatedAtDesc(UserType userType, Boolean active);
}
