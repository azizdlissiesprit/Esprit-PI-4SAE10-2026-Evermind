package tn.esprit.user.Service;

import tn.esprit.user.DTO.AuthenticationResponse;
import tn.esprit.user.DTO.LoginRequest; // <--- Import your class
import tn.esprit.user.DTO.RegisterRequest;

public interface IAuthenticationService {
    AuthenticationResponse register(RegisterRequest request);
    AuthenticationResponse authenticate(LoginRequest request);
    public boolean verifyUser(String verificationCode);// <--- Use LoginRequest here
}