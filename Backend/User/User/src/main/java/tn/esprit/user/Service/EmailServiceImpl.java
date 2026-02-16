package tn.esprit.user.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements IEmailService {

    private final JavaMailSender mailSender; // This error will disappear after adding the dependency

    @Override
    public void sendVerificationEmail(String to, String name, String code) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        // Make sure this email matches what you put in application.properties
        helper.setFrom("YOUR_EMAIL@gmail.com");
        helper.setTo(to);
        helper.setSubject("Account Verification - Alzheimer Care");

        String verifyUrl = "http://localhost:4200/verify?code=" + code;

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
}