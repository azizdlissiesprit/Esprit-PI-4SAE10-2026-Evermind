package tn.esprit.user.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.user.Config.JwtUtils;
import tn.esprit.user.DTO.AuthenticationResponse;
import tn.esprit.user.DTO.LoginRequest;
import tn.esprit.user.DTO.RegisterRequest;
import tn.esprit.user.Entity.User;
import tn.esprit.user.Repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements IAuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthenticationResponse register(RegisterRequest request) {
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .userType(request.getUserType())
                .active(true)
                .build();

        repository.save(user);

        // --- FIX IS HERE ---
        // Your JwtUtils expects a String (email), not the User object
        var jwtToken = jwtUtils.generateToken(user.getEmail());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getUserType())
                .build();
    }

    @Override
    public AuthenticationResponse authenticate(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var user = repository.findByEmail(request.getEmail()).orElseThrow();

        // --- FIX IS HERE ---
        // Pass the String email, not the object
        var jwtToken = jwtUtils.generateToken(user.getEmail());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getUserType())
                .build();
    }
}