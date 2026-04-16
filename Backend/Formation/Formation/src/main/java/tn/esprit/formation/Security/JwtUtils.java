package tn.esprit.formation.Security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.stream.Collectors;

@Component
@Slf4j
public class JwtUtils {

    @Value("${app.jwtSecret:my-super-secret-key-that-is-at-least-256-bits-long-for-HS256-algorithm}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs:86400000}")
    private long jwtExpirationMs;

    @Value("${app.jwtRefreshExpirationMs:604800000}")
    private long jwtRefreshExpirationMs;

    /**
     * Génère une clé secrète HMAC
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Génère un JWT token à partir de l'authentification
     */
    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        String roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
        return generateTokenFromEmail(userPrincipal.getEmail(), roles);
    }

    /**
     * Génère un JWT token à partir de l'email et des rôles
     */
    public String generateTokenFromEmail(String email, String roles) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
            .setSubject(email)
            .claim("roles", roles)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }

    /**
     * Génère un refresh token
     */
    public String generateRefreshToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtRefreshExpirationMs);

        return Jwts.builder()
            .setSubject(email)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }

    /**
     * Extrait l'email du JWT
     */
    public String getEmailFromJwtToken(String token) {
        try {
            Jws<Claims> claimsJws = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return claimsJws.getBody().getSubject();
        } catch (Exception e) {
            log.error("Erreur lors de l'extraction de l'email du JWT: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Valide un JWT token
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException ex) {
            log.error("JWT invalide: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.error("JWT expiré: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.error("JWT non supporté: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("Claims JWT vides: {}", ex.getMessage());
        }
        return false;
    }

    /**
     * Extrait les rôles du JWT
     */
    public String getRolesFromJwtToken(String token) {
        try {
            Jws<Claims> claimsJws = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return claimsJws.getBody().get("roles", String.class);
        } catch (Exception e) {
            log.error("Erreur lors de l'extraction des rôles du JWT: {}", e.getMessage());
        }
        return null;
    }

    public long getJwtExpirationMs() {
        return jwtExpirationMs;
    }
}
