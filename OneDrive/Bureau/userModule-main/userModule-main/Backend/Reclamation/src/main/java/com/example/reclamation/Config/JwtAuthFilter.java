package com.example.reclamation.Config;

import com.example.reclamation.Security.JwtAuthenticatedUser;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7).trim();
        if (jwt.isEmpty() || "null".equalsIgnoreCase(jwt) || "undefined".equalsIgnoreCase(jwt)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Claims claims = jwtUtils.extractAllClaims(jwt);
            String username = claims.getSubject();
            Long userId = extractUserId(claims);
            Collection<SimpleGrantedAuthority> authorities = extractAuthorities(claims);

            JwtAuthenticatedUser principal = new JwtAuthenticatedUser(userId, username);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    authorities
            );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception exception) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private Long extractUserId(Claims claims) {
        Object userId = claims.get("userId");
        if (userId instanceof Integer integerValue) {
            return integerValue.longValue();
        }
        if (userId instanceof Long longValue) {
            return longValue;
        }
        if (userId instanceof String stringValue && !stringValue.isBlank()) {
            try {
                return Long.parseLong(stringValue);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private Collection<SimpleGrantedAuthority> extractAuthorities(Claims claims) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        Object rolesClaim = claims.get("roles");
        if (rolesClaim instanceof Collection<?> roleValues) {
            for (Object roleValue : roleValues) {
                if (roleValue != null) {
                    authorities.add(new SimpleGrantedAuthority(roleValue.toString()));
                }
            }
        }
        return authorities;
    }
}
