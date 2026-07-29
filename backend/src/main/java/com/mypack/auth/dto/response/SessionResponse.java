package com.mypack.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class SessionResponse {
    private String familyId;
    private String userAgent;
    private String ipAddress;
    private LocalDateTime issuedAt;
    private LocalDateTime lastUsedAt;
    private LocalDateTime expiresAt;
    private boolean current;
}
