package tn.esprit.user.Service;

import org.springframework.web.multipart.MultipartFile;
import tn.esprit.user.DTO.AuthenticationResponse;
import tn.esprit.user.DTO.ForgotPasswordRequest;
import tn.esprit.user.DTO.LoginRequest; // <--- Import your class
import tn.esprit.user.DTO.RegisterRequest;
import tn.esprit.user.DTO.ResetPasswordRequest;

public interface IAuthenticationService {
    AuthenticationResponse register(RegisterRequest request);
    AuthenticationResponse registerWithFace(RegisterRequest request, MultipartFile faceImage);
    AuthenticationResponse authenticate(LoginRequest request);
    AuthenticationResponse authenticateWithFace(LoginRequest request, MultipartFile faceImage);
    public boolean verifyUser(String verificationCode);// <--- Use LoginRequest here
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
