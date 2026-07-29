package com.mypack.auth.controller;

import com.mypack.auth.dto.response.MessageResponse;
import com.mypack.auth.service.RefreshTokenService;
import com.mypack.auth.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Terminates the CURRENT session only (this device/browser).
 * For terminating other devices or all devices at once, see SessionController.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class LogoutController {

    private final RefreshTokenService refreshTokenService;
    private final CookieUtil cookieUtil;

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(HttpServletRequest request, HttpServletResponse response) {

        String rawToken = cookieUtil.extractRefreshToken(request);
        if (rawToken != null) {
            // Revoke the whole family tied to this device, then drop the cookie.
            refreshTokenService.revokeByRawToken(rawToken);
        }
        cookieUtil.clearRefreshCookie(response);

        return ResponseEntity.ok(MessageResponse.builder()
                .success(true)
                .message("Logged out successfully.")
                .build());
    }
}
