package tn.esprit.user.Config;

import org.junit.jupiter.api.Test;
import tn.esprit.user.Entity.User;
import tn.esprit.user.Entity.UserType;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;

class JwtUtilsTest {

    private final JwtUtils jwtUtils = new JwtUtils();

    @Test
    void generateTokenShouldProduceReadableValidToken() {
        User user = User.builder()
                .userId(42L)
                .email("jwt@example.com")
                .passwordHash("hashed")
                .userType(UserType.ADMIN)
                .active(true)
                .build();

        String token = jwtUtils.generateToken(user);

        assertNotNull(token);
        assertEquals("jwt@example.com", jwtUtils.extractUsername(token));
        assertEquals(42L, jwtUtils.extractUserId(token));
        assertEquals("ADMIN", jwtUtils.extractUserType(token));
        assertIterableEquals(
                java.util.List.of("ADMIN"),
                jwtUtils.extractClaim(token, claims -> claims.get("roles", java.util.List.class))
        );
        assertTrue(jwtUtils.validateToken(token, user));
        assertNotNull(jwtUtils.extractExpiration(token));
    }
}
