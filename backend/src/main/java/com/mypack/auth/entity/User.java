package com.mypack.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    // null for OAuth users (Google/GitHub)
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // Role-wise permission module
    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20, columnDefinition = "varchar(20) not null default 'USER'")
    @Builder.Default
    private Role role = Role.USER;

    // How this account was created — LOCAL (email/password) or GOOGLE
    @Enumerated(EnumType.STRING)
    @Column(name = "provider", length = 20, columnDefinition = "varchar(20) not null default 'LOCAL'")
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    // Google's "sub" claim — null for LOCAL accounts
    @Column(name = "provider_id", length = 255)
    private String providerId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
