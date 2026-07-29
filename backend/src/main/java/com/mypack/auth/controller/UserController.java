package com.mypack.auth.controller;

import com.mypack.auth.dto.request.UpdateRoleRequest;
import com.mypack.auth.dto.response.UserResponse;
import com.mypack.auth.entity.User;
import com.mypack.auth.exception.InvalidCredentialsException;
import com.mypack.auth.exception.UserNotFoundException;
import com.mypack.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Everything here requires a valid Bearer access token — see SecurityConfig,
 * "/api/users/**" is NOT in the permit-all list, so JwtAuthFilter must have
 * populated the SecurityContext for any of these to be reachable.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // Rendered on the Home screen: every authenticated user can see who
    // else is registered (name, email, role, provider — never the password hash).
    @GetMapping
    public ResponseEntity<List<UserResponse>> listUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(this::toResponse)
                .sorted(Comparator.comparing(UserResponse::getCreatedAt).reversed())
                .toList();
        return ResponseEntity.ok(users);
    }

    // The Sidebar/Navbar use this to know who's logged in and what role they have.
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(toResponse(currentUser()));
    }

    // Role-wise permission module: only ADMIN can change anyone's role.
    // Backed by a real Spring Security authority check (not just a UI hint) —
    // see UserDetailsService, which loads the authority from User.role.
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoleRequest request) {

        User target = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found."));

        User admin = currentUser();
        if (admin.getId().equals(target.getId())) {
            throw new InvalidCredentialsException("You cannot change your own role.");
        }

        target.setRole(request.getRole());
        userRepository.save(target);

        return ResponseEntity.ok(toResponse(target));
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found."));
    }

    private UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole())
                .provider(u.getProvider())
                .isVerified(u.getIsVerified())
                .isActive(u.getIsActive())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
