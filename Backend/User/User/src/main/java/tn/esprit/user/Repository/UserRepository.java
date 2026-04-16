package tn.esprit.user.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.user.Entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    // Optional: Useful for registration to check if email is already taken
    boolean existsByEmail(String email);
    Optional<User> findByVerificationCode(String verificationCode);
}
