package com.mypack.auth.controller;

import com.mypack.auth.dto.request.ForgotPasswordRequest;
import com.mypack.auth.dto.request.ResetPasswordRequest;
import com.mypack.auth.dto.response.MessageResponse;
import com.mypack.auth.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestReset(request.getEmail());

        // Same message whether or not the email exists — avoids leaking
        // which addresses are registered.
        return ResponseEntity.ok(MessageResponse.builder()
                .success(true)
                .message("If an account exists for that email, a password reset link has been sent.")
                .build());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());

        return ResponseEntity.ok(MessageResponse.builder()
                .success(true)
                .message("Password updated successfully. Please log in with your new password.")
                .build());
    }
}
