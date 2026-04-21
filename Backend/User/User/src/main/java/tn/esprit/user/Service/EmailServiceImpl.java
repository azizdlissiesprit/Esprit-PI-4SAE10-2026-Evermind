package tn.esprit.user.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements IEmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendVerificationEmail(String to, String name, String code) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject("Account Verification - Alzheimer Care.");

        String verifyUrl = "http://localhost:4200/auth/verify-email?code=" + code;

        String content = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>"
                + "<h2 style='color: #4E80EE;'>Welcome to Alzheimer Care</h2>"
                + "<p>Hello, <strong>" + name + "</strong>,</p>"
                + "<p>Thank you for registering. Please activate your account by clicking the button below:</p>"
                + "<a href=\"" + verifyUrl + "\" style='background-color: #4E80EE; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Activate Account</a>"
                + "<p style='margin-top: 20px; font-size: 12px; color: #888;'>If you did not request this, please ignore this email.</p>"
                + "</div>";

        helper.setText(content, true); // true = HTML content
        mailSender.send(message);
    }

    @Override
    public void sendPasswordResetEmail(String to, String name, String resetToken) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject("Password Reset - Alzheimer Care");

        String resetUrl = "http://localhost:4200/reset-password?token=" + resetToken;

        String content = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>"
                + "<h2 style='color: #4E80EE;'>Password Reset Request</h2>"
                + "<p>Hello, <strong>" + name + "</strong>,</p>"
                + "<p>We received a request to reset your password. Click the button below to reset it:</p>"
                + "<a href=\"" + resetUrl + "\" style='background-color: #4E80EE; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Reset Password</a>"
                + "<p style='margin-top: 20px;'>This link will expire in 1 hour.</p>"
                + "<p style='font-size: 12px; color: #888;'>If you did not request this, please ignore this email.</p>"
                + "</div>";

        helper.setText(content, true);
        mailSender.send(message);
    }
}
