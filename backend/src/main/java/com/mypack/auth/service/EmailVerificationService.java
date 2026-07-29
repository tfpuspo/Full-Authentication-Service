package com.mypack.auth.service;

import com.mypack.auth.dto.request.ResendVerificationRequest;
import com.mypack.auth.dto.response.ResendVerificationResponse;
import com.mypack.auth.dto.response.VerifyEmailResponse;
import com.mypack.auth.entity.EmailVerification;
import com.mypack.auth.entity.User;
import com.mypack.auth.exception.EmailAlreadyVerifiedException;
import com.mypack.auth.exception.TokenInvalidException;
import com.mypack.auth.exception.UserNotFoundException;
import com.mypack.auth.repository.EmailVerificationRepository;
import com.mypack.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final UserRepository              userRepository;
    private final EmailService                emailService;

    // ── Called when user clicks link in email ─────────────────
    // GET /api/auth/verify-email?token=xxx
    @Transactional
    public VerifyEmailResponse verifyEmail(String token) {

        // Step 1 — Find token in email_verifications table
        EmailVerification verification = emailVerificationRepository
                .findByVerifyToken(token)
                .orElseThrow(() -> new TokenInvalidException(
                    "Verification link is invalid. Please request a new one."
                ));

        // Step 2 — Check token not already used
        if (verification.getIsUsed()) {
            throw new TokenInvalidException(
                "This verification link has already been used. Please log in."
            );
        }

        // Step 3 — Check token not expired (24 hours)
        if (verification.isExpired()) {
            throw new TokenInvalidException(
                "Verification link has expired. Please request a new one."
            );
        }

        // Step 4 — Mark user as verified in users table
        User user = verification.getUser();
        user.setIsVerified(true);
        userRepository.save(user);
        log.info("Email verified for user: {}", user.getEmail());

        // Step 5 — Mark token as used — cannot be used again
        verification.setIsUsed(true);
        emailVerificationRepository.save(verification);

        return VerifyEmailResponse.builder()
                .success(true)
                .message("Email verified successfully! You can now log in.")
                .build();
    }

    // ── Called when user clicks "Resend verification email" ───
    // POST /api/auth/resend-verification
    @Transactional
    public ResendVerificationResponse resendVerification(
            ResendVerificationRequest request) {

        // Step 1 — Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException(
                    "No account found with this email address."
                ));

        // Step 2 — Check if already verified
        if (user.getIsVerified()) {
            throw new EmailAlreadyVerifiedException(
                "This email is already verified. Please log in."
            );
        }

        // Step 3 — Delete old verification tokens for this user
        emailVerificationRepository.deleteByUser(user);

        // Step 4 — Create new token
        String newToken = UUID.randomUUID().toString();

        EmailVerification newVerification = EmailVerification.builder()
                .user(user)
                .verifyToken(newToken)
                .isUsed(false)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();

        emailVerificationRepository.save(newVerification);

        // Step 5 — Send new email
        emailService.sendVerificationEmail(
            user.getEmail(),
            user.getName(),
            newToken
        );

        log.info("Verification email resent to: {}", user.getEmail());

        return ResendVerificationResponse.builder()
                .success(true)
                .message("Verification email sent! Please check your inbox.")
                .build();
    }

    // ── Called by AuthService after register ──────────────────
    // Creates and saves the first verification token
    @Transactional
    public void createAndSendVerificationToken(User user) {

        String token = UUID.randomUUID().toString();

        EmailVerification verification = EmailVerification.builder()
                .user(user)
                .verifyToken(token)
                .isUsed(false)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();

        emailVerificationRepository.save(verification);

        emailService.sendVerificationEmail(
            user.getEmail(),
            user.getName(),
            token
        );

        log.info("Verification token created for: {}", user.getEmail());
    }
}
