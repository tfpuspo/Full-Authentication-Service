package com.mypack.auth.controller;

import com.mypack.auth.dto.request.LoginRequest;
import com.mypack.auth.dto.request.RegisterRequest;
import com.mypack.auth.dto.response.LoginResponse;
import com.mypack.auth.dto.response.RegisterResponse;
import com.mypack.auth.entity.User;
import com.mypack.auth.exception.InvalidCredentialsException;
import com.mypack.auth.repository.UserRepository;
import com.mypack.auth.service.AuthService;
import com.mypack.auth.service.RefreshTokenService;
import com.mypack.auth.util.CookieUtil;
import com.mypack.auth.util.RequestUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final CookieUtil cookieUtil;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        LoginResponse loginResponse = authService.login(request);

        User user = userRepository.findByEmail(loginResponse.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));

        String userAgent = httpRequest.getHeader("User-Agent");
        String ip = RequestUtil.clientIp(httpRequest);

        // Creates a brand-new session/device family and stores it (hashed) in the DB
        String refreshToken = refreshTokenService.issueNewSession(user, userAgent, ip);
        cookieUtil.addRefreshCookie(httpResponse, refreshToken);

        return ResponseEntity.ok(loginResponse);
    }
}
