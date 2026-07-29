package com.mypack.auth.controller;

import com.mypack.auth.dto.response.MessageResponse;
import com.mypack.auth.dto.response.SessionResponse;
import com.mypack.auth.entity.RefreshToken;
import com.mypack.auth.entity.User;
import com.mypack.auth.exception.UserNotFoundException;
import com.mypack.auth.repository.UserRepository;
import com.mypack.auth.service.RefreshTokenService;
import com.mypack.auth.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Requires a valid access token (Authorization: Bearer ...) — see SecurityConfig,
 * everything under /api/auth/sessions is NOT in the permit-all list.
 */
@RestController
@RequestMapping("/api/auth/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final CookieUtil cookieUtil;

    @GetMapping
    public ResponseEntity<List<SessionResponse>> listSessions(HttpServletRequest request) {
        User user = currentUser();

        UUID currentFamily = null;
        String currentRaw = cookieUtil.extractRefreshToken(request);
        if (currentRaw != null) {
            currentFamily = refreshTokenService.findFamilyIdByRawToken(currentRaw).orElse(null);
        }
        final UUID currentFamilyFinal = currentFamily;

        List<SessionResponse> sessions = refreshTokenService.listActiveSessions(user.getId())
                .stream()
                .map(rt -> toResponse(rt, currentFamilyFinal))
                .toList();

        return ResponseEntity.ok(sessions);
    }

    @DeleteMapping("/{familyId}")
    public ResponseEntity<MessageResponse> revokeSession(
            @PathVariable UUID familyId,
            HttpServletRequest request,
            HttpServletResponse response) {

        User user = currentUser();
        refreshTokenService.revokeFamilyForUser(familyId, user.getId());

        // If the caller just revoked the session they're currently using, drop their cookie too
        String currentRaw = cookieUtil.extractRefreshToken(request);
        if (currentRaw != null) {
            refreshTokenService.findFamilyIdByRawToken(currentRaw)
                    .filter(familyId::equals)
                    .ifPresent(f -> cookieUtil.clearRefreshCookie(response));
        }

        return ResponseEntity.ok(MessageResponse.builder()
                .success(true)
                .message("Session revoked.")
                .build());
    }

    @PostMapping("/logout-all")
    public ResponseEntity<MessageResponse> logoutAll(HttpServletResponse response) {
        User user = currentUser();
        refreshTokenService.revokeAllForUser(user.getId());
        cookieUtil.clearRefreshCookie(response);

        return ResponseEntity.ok(MessageResponse.builder()
                .success(true)
                .message("Logged out of all devices.")
                .build());
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found."));
    }

    private SessionResponse toResponse(RefreshToken rt, UUID currentFamily) {
        return SessionResponse.builder()
                .familyId(rt.getFamilyId().toString())
                .userAgent(rt.getUserAgent())
                .ipAddress(rt.getIpAddress())
                .issuedAt(rt.getIssuedAt())
                .lastUsedAt(rt.getLastUsedAt())
                .expiresAt(rt.getExpiresAt())
                .current(rt.getFamilyId().equals(currentFamily))
                .build();
    }
}
