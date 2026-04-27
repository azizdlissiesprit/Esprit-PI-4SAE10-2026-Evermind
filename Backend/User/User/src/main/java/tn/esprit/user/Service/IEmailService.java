package tn.esprit.user.Service;

import jakarta.mail.MessagingException;

public interface IEmailService {
    void sendVerificationEmail(String to, String name, String code) throws MessagingException;
    void sendPasswordResetEmail(String to, String name, String resetToken) throws MessagingException;
}