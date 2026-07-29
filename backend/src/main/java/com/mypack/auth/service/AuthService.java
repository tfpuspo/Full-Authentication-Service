package com.mypack.auth.service;

import com.mypack.auth.dto.request.RegisterRequest;
import com.mypack.auth.dto.response.RegisterResponse;
import com.mypack.auth.entity.User;
import com.mypack.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.mypack.auth.dto.request.LoginRequest;
import com.mypack.auth.dto.response.LoginResponse;
import com.mypack.auth.exception.InvalidCredentialsException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final JwtService jwtService;


    // ── REGISTER ──────────────────────────────────────────────
    public RegisterResponse register(RegisterRequest request) {

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .isVerified(false)
                .isActive(true)
                .build();

        userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        emailVerificationService.createAndSendVerificationToken(user);

        return RegisterResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .isVerified(false)
                .message("Registration successful! Please check your email to verify your account.")
                .build();
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            // Covers both "wrong password" and "this account was created via
            // Google and has no password at all" — same generic message either
            // way, so we don't leak how the account was created.
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        if (!user.getIsVerified()) {
            throw new InvalidCredentialsException("Please verify your email before logging in.");
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail());

        return LoginResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .accessToken(accessToken)
                .build();
    }

}
