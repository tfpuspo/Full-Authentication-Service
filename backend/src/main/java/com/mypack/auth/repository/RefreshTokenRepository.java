package com.mypack.auth.repository;

import com.mypack.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findByFamilyId(UUID familyId);

    List<RefreshToken> findByUser_IdAndRevokedFalse(UUID userId);

    // One non-revoked, non-expired row per family == one active session ("device")
    List<RefreshToken> findByUser_IdAndRevokedFalseAndExpiresAtAfterOrderByLastUsedAtDesc(
            UUID userId, LocalDateTime now);
}
