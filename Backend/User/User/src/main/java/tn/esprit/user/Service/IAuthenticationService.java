package tn.esprit.user.Service;

import tn.esprit.user.DTO.AuthenticationResponse;
import tn.esprit.user.DTO.ForgotPasswordRequest;
import tn.esprit.user.DTO.LoginRequest; // <--- Import your class
import tn.esprit.user.DTO.RegisterRequest;
import tn.esprit.user.DTO.ResetPasswordRequest;

public interface IAuthenticationService {
    AuthenticationResponse register(RegisterRequest request);
    AuthenticationResponse authenticate(LoginRequest request);
    public boolean verifyUser(String verificationCode);// <--- Use LoginRequest here
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}