package com.mypack.auth.controller;

import com.mypack.auth.entity.AuthProvider;
import com.mypack.auth.entity.Role;
import com.mypack.auth.entity.User;
import com.mypack.auth.repository.UserRepository;
import com.mypack.auth.service.GoogleOAuthService;
import com.mypack.auth.service.RefreshTokenService;
import com.mypack.auth.util.CookieUtil;
import com.mypack.auth.util.RequestUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * "Continue with Google" — standard OAuth2 Authorization Code flow.
 *
 * GET /api/auth/google           -> 302 to Google's consent screen
 * GET /api/auth/google/callback  -> Google redirects back here with `code`;
 *                                    we exchange it, upsert the user, open a
 *                                    normal session (refresh cookie), then
 *                                    302 the browser back to the SPA.
 *
 * Deliberately no access token is ever put in a URL: the callback sets the
 * same HttpOnly refresh cookie a normal login does, and the frontend's
 * /oauth/callback page just calls the existing silent-refresh endpoint to
 * pick up an access token.
 */
@RestController
@RequestMapping("/api/auth/google")
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthController {

    private final GoogleOAuthService googleOAuthService;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final CookieUtil cookieUtil;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @GetMapping
    public void redirectToGoogle(HttpServletResponse response) throws IOException {
        String state = UUID.randomUUID().toString();
        response.sendRedirect(googleOAuthService.buildAuthorizationUrl(state));
    }

    @GetMapping("/callback")
    public void callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String error,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        if (error != null || code == null || code.isBlank()) {
            redirectWithError(response, "Google sign-in was cancelled.");
            return;
        }

        try {
            GoogleOAuthService.GoogleUserInfo info = googleOAuthService.exchangeCodeForUserInfo(code);

            User user = userRepository.findByEmail(info.email()).orElseGet(() -> {
                User created = User.builder()
                        .name(info.name())
                        .email(info.email())
                        .passwordHash(null) // no local password for a pure Google account
                        .isVerified(true)   // Google already verified this address
                        .isActive(true)
                        .role(Role.USER)
                        .provider(AuthProvider.GOOGLE)
                        .providerId(info.sub())
                        .build();
                return userRepository.save(created);
            });

            // If an existing LOCAL account shares this email, link the Google identity
            // to it instead of creating a duplicate user.
            if (user.getProvider() == AuthProvider.LOCAL) {
                user.setProvider(AuthProvider.GOOGLE);
                user.setProviderId(info.sub());
                if (!Boolean.TRUE.equals(user.getIsVerified())) {
                    user.setIsVerified(true);
                }
                userRepository.save(user);
            }

            if (!Boolean.TRUE.equals(user.getIsActive())) {
                redirectWithError(response, "This account has been deactivated.");
                return;
            }

            String userAgent = request.getHeader("User-Agent");
            String ip = RequestUtil.clientIp(request);
            String refreshToken = refreshTokenService.issueNewSession(user, userAgent, ip);
            cookieUtil.addRefreshCookie(response, refreshToken);

            response.sendRedirect(frontendUrl + "/oauth/callback");
        } catch (Exception ex) {
            log.error("Google OAuth callback failed", ex);
            redirectWithError(response, "Google sign-in failed. Please try again.");
        }
    }

    private void redirectWithError(HttpServletResponse response, String message) throws IOException {
        String encoded = URLEncoder.encode(message, StandardCharsets.UTF_8);
        response.sendRedirect(frontendUrl + "/login?oauthError=" + encoded);
    }
}
