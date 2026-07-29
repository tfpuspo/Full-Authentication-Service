package com.mypack.auth.controller;

import com.mypack.auth.dto.response.LoginResponse;
import com.mypack.auth.entity.User;
import com.mypack.auth.exception.InvalidCredentialsException;
import com.mypack.auth.service.JwtService;
import com.mypack.auth.service.RefreshTokenService;
import com.mypack.auth.util.CookieUtil;
import com.mypack.auth.util.RequestUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Silent-refresh endpoint. Called:
 *  - once on app load (to restore a session from the HttpOnly cookie)
 *  - automatically whenever the short-lived access token is about to expire
 *  - reactively, by the frontend's fetch wrapper, after any 401
 *
 * Every call ROTATES the refresh token: the old one is revoked and a new one
 * (same "family") is issued. If a revoked token is ever replayed, the whole
 * family is killed — see RefreshTokenService.rotate().
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class RefreshController {

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final CookieUtil cookieUtil;

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(HttpServletRequest request, HttpServletResponse response) {

        String rawToken = cookieUtil.extractRefreshToken(request);
        if (rawToken == null) {
            throw new InvalidCredentialsException("No active session. Please log in again.");
        }

        String userAgent = request.getHeader("User-Agent");
        String ip = RequestUtil.clientIp(request);

        RefreshTokenService.RotationResult result;
        try {
            result = refreshTokenService.rotate(rawToken, userAgent, ip);
        } catch (InvalidCredentialsException ex) {
            // Session invalid/reused/expired — make sure the browser drops the stale cookie
            cookieUtil.clearRefreshCookie(response);
            throw ex;
        }

        User user = result.getUser();
        String newAccessToken = jwtService.generateAccessToken(user.getEmail());
        cookieUtil.addRefreshCookie(response, result.getRawToken());

        return ResponseEntity.ok(LoginResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .accessToken(newAccessToken)
                .build());
    }
}
