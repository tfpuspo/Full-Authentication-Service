package com.mypack.auth.dto.response;

import com.mypack.auth.entity.AuthProvider;
import com.mypack.auth.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private Role role;
    private AuthProvider provider;
    private Boolean isVerified;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
