package com.mypack.auth.service;

import com.mypack.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

// NOTE: this class is intentionally named UserDetailsService (same simple name
// as Spring's own interface) to keep the historical package layout. Because of
// the name collision we reference Spring's interface/types by fully-qualified
// name below instead of importing them.
@Service
@RequiredArgsConstructor
public class UserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String email)
            throws org.springframework.security.core.userdetails.UsernameNotFoundException {

        return userRepository.findByEmail(email)
                .map(user ->
                        org.springframework.security.core.userdetails.User
                                .withUsername(user.getEmail())
                                .password(user.getPasswordHash() == null ? "" : user.getPasswordHash())
                                .roles(user.getRole().name())
                                .build()
                )
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                        "User not found: " + email
                ));
    }
}
