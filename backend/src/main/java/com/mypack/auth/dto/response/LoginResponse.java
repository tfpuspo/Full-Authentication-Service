package com.mypack.auth.dto.response;

import com.mypack.auth.entity.Role;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class LoginResponse {
    private UUID id;
    private String name;
    private String email;
    private Role role;
    private String accessToken;
    // NOTE: refreshToken is NOT included here — it goes out as an HttpOnly cookie, not JSON
}
