package com.mypack.auth.service;

import com.mypack.auth.entity.RefreshToken;
import com.mypack.auth.entity.User;
import com.mypack.auth.exception.InvalidCredentialsException;
import com.mypack.auth.exception.ResourceNotFoundException;
import com.mypack.auth.repository.RefreshTokenRepository;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // ── Result of a rotation ────────────────────────────────────
    @Getter
    @AllArgsConstructor
    public static class RotationResult {
        private final User user;
        private final String rawToken;
        private final UUID familyId;
    }

    // ── Start a brand-new session (e.g. on login) ───────────────
    @Transactional
    public String issueNewSession(User user, String userAgent, String ipAddress) {
        UUID familyId = UUID.randomUUID();
        return issueToken(user, familyId, userAgent, ipAddress);
    }

    private String issueToken(User user, UUID familyId, String userAgent, String ipAddress) {
        String raw = generateRawToken();
        LocalDateTime now = LocalDateTime.now();

        RefreshToken token = RefreshToken.builder()
                .user(user)
                .familyId(familyId)
                .tokenHash(hash(raw))
                .issuedAt(now)
                .expiresAt(now.plusNanos(refreshExpirationMs * 1_000_000L))
                .revoked(false)
                .userAgent(trim(userAgent))
                .ipAddress(trim(ipAddress))
                .lastUsedAt(now)
                .build();

        refreshTokenRepository.save(token);
        return raw;
    }

    // ── Rotate: validate incoming token, revoke it, issue a new one ─
    @Transactional
    public RotationResult rotate(String rawToken, String userAgent, String ipAddress) {
        RefreshToken existing = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new InvalidCredentialsException(
                        "Session not recognized. Please log in again."));

        if (Boolean.TRUE.equals(existing.getRevoked())) {
            // REUSE DETECTED: a token that was already rotated-out is being replayed.
            // Treat this as a compromised session and kill the whole family.
            log.warn("Refresh token reuse detected for user {} family {} — revoking family",
                    existing.getUser().getEmail(), existing.getFamilyId());
            revokeFamily(existing.getFamilyId());
            throw new InvalidCredentialsException(
                    "Session invalid — this session has been revoked for your security. Please log in again.");
        }

        if (existing.isExpired()) {
            throw new InvalidCredentialsException("Session expired. Please log in again.");
        }

        existing.setRevoked(true);
        existing.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(existing);

        String newRaw = issueToken(existing.getUser(), existing.getFamilyId(), userAgent, ipAddress);
        return new RotationResult(existing.getUser(), newRaw, existing.getFamilyId());
    }

    // ── Revoke everything in a family (reuse detection / device logout) ─
    @Transactional
    public void revokeFamily(UUID familyId) {
        List<RefreshToken> tokens = refreshTokenRepository.findByFamilyId(familyId);
        LocalDateTime now = LocalDateTime.now();
        tokens.forEach(t -> {
            t.setRevoked(true);
            t.setRevokedAt(now);
        });
        refreshTokenRepository.saveAll(tokens);
    }

    // ── Revoke a family only if it belongs to the given user (ownership check) ─
    @Transactional
    public void revokeFamilyForUser(UUID familyId, UUID userId) {
        List<RefreshToken> tokens = refreshTokenRepository.findByFamilyId(familyId);
        boolean ownsFamily = tokens.stream()
                .anyMatch(t -> t.getUser().getId().equals(userId));
        if (!ownsFamily) {
            throw new ResourceNotFoundException("Session not found.");
        }
        revokeFamily(familyId);
    }

    // ── Revoke every session for a user (logout of all devices) ─
    @Transactional
    public void revokeAllForUser(UUID userId) {
        List<RefreshToken> tokens = refreshTokenRepository.findByUser_IdAndRevokedFalse(userId);
        LocalDateTime now = LocalDateTime.now();
        tokens.forEach(t -> {
            t.setRevoked(true);
            t.setRevokedAt(now);
        });
        refreshTokenRepository.saveAll(tokens);
    }

    // ── Revoke by raw token value (used on plain logout) ─
    @Transactional
    public void revokeByRawToken(String rawToken) {
        refreshTokenRepository.findByTokenHash(hash(rawToken))
                .ifPresent(t -> revokeFamily(t.getFamilyId()));
    }

    // ── List active sessions ("devices") for a user ─
    public List<RefreshToken> listActiveSessions(UUID userId) {
        return refreshTokenRepository.findByUser_IdAndRevokedFalseAndExpiresAtAfterOrderByLastUsedAtDesc(
                userId, LocalDateTime.now());
    }

    public Optional<UUID> findFamilyIdByRawToken(String rawToken) {
        return refreshTokenRepository.findByTokenHash(hash(rawToken))
                .map(RefreshToken::getFamilyId);
    }

    // ── Helpers ──────────────────────────────────────────────────
    private String generateRawToken() {
        byte[] bytes = new byte[64];
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

    private String trim(String value) {
        if (value == null) return null;
        return value.length() > 500 ? value.substring(0, 500) : value;
    }
}
