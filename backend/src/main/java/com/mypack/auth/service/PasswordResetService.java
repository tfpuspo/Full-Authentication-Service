package com.mypack.auth.service;

import com.mypack.auth.entity.PasswordResetToken;
import com.mypack.auth.entity.User;
import com.mypack.auth.exception.TokenInvalidException;
import com.mypack.auth.repository.PasswordResetTokenRepository;
import com.mypack.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.password-reset.expiration-minutes:30}")
    private long expirationMinutes;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // ── Step 1: user requests a reset link ──────────────────────
    // Always "succeeds" from the caller's point of view — we never reveal
    // whether an email address is registered (prevents account enumeration).
    @Transactional
    public void requestReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            // Invalidate any previous unused links before issuing a new one
            List<PasswordResetToken> existing =
                    passwordResetTokenRepository.findByUser_IdAndUsedFalse(user.getId());
            existing.forEach(t -> t.setUsed(true));
            passwordResetTokenRepository.saveAll(existing);

            String rawToken = generateRawToken();
            PasswordResetToken token = PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(hash(rawToken))
                    .expiresAt(LocalDateTime.now().plusMinutes(expirationMinutes))
                    .used(false)
                    .build();
            passwordResetTokenRepository.save(token);

            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), rawToken);
            log.info("Password reset requested for {}", user.getEmail());
        });
    }

    // ── Step 2: user submits the token + new password ───────────
    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new TokenInvalidException("Invalid or expired reset link. Please request a new one."));

        if (Boolean.TRUE.equals(token.getUsed())) {
            throw new TokenInvalidException("This reset link has already been used. Please request a new one.");
        }
        if (token.isExpired()) {
            throw new TokenInvalidException("This reset link has expired. Please request a new one.");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        // A password change is a strong security event — sign the user out
        // of every device so a possibly-compromised session can't linger.
        refreshTokenService.revokeAllForUser(user.getId());

        log.info("Password reset completed for {}", user.getEmail());
    }

    // ── Helpers ──────────────────────────────────────────────────
    private String generateRawToken() {
        byte[] bytes = new byte[48];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashed) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
