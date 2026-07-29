package com.mypack.auth.dto.response;

import lombok.*;
import java.util.UUID;

@Getter @Setter @Builder @AllArgsConstructor
public class RegisterResponse {
    private UUID    id;
    private String  name;
    private String  email;
    private Boolean isVerified;
    private String  message;
}
