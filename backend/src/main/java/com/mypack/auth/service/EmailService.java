package com.mypack.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ── Send verification email after register ─────────────────
    public void sendVerificationEmail(String toEmail, String name, String token) {

        // This link is what the user clicks in their email
        // It calls GET /api/auth/verify-email?token=xxx
        String verifyLink = baseUrl + "/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Verify your email address — MyApp");
        message.setText(
            "Hi " + name + ",\n\n" +
            "Thank you for registering with MyApp!\n\n" +
            "Please click the link below to verify your email address:\n\n" +
            verifyLink + "\n\n" +
            "This link will expire in 24 hours.\n\n" +
            "If you did not create an account, please ignore this email.\n\n" +
            "Best regards,\n" +
            "The MyApp Team"
        );

        mailSender.send(message);
        log.info("Verification email sent to: {}", toEmail);
    }

    // ── Send password reset email after forgot-password request ─
    public void sendPasswordResetEmail(String toEmail, String name, String token) {

        // This link is what the user clicks in their email
        // The frontend route reads the token and calls POST /api/auth/reset-password
        String resetLink = baseUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Reset your password — MyApp");
        message.setText(
            "Hi " + name + ",\n\n" +
            "We received a request to reset your MyApp password.\n\n" +
            "Click the link below to choose a new password:\n\n" +
            resetLink + "\n\n" +
            "This link will expire in 30 minutes.\n\n" +
            "If you did not request a password reset, you can safely ignore this email — " +
            "your password will not be changed.\n\n" +
            "Best regards,\n" +
            "The MyApp Team"
        );

        mailSender.send(message);
        log.info("Password reset email sent to: {}", toEmail);
    }
}
