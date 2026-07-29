package com.mypack.auth.controller;

import com.mypack.auth.dto.request.ResendVerificationRequest;
import com.mypack.auth.dto.response.ResendVerificationResponse;
import com.mypack.auth.dto.response.VerifyEmailResponse;
import com.mypack.auth.service.EmailVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    @GetMapping("/verify-email")
    public ResponseEntity<VerifyEmailResponse> verifyEmail(
            @RequestParam String token) {

        VerifyEmailResponse response = emailVerificationService.verifyEmail(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ResendVerificationResponse> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {

        ResendVerificationResponse response =
                emailVerificationService.resendVerification(request);
        return ResponseEntity.ok(response);
    }
}
