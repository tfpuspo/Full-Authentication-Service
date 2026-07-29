package com.mypack.auth.repository;

import com.mypack.auth.entity.EmailVerification;
import com.mypack.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationRepository
        extends JpaRepository<EmailVerification, UUID> {

    // Find by token — called when user clicks verify link
    Optional<EmailVerification> findByVerifyToken(String verifyToken);

    // Delete old tokens when resending verification email
    void deleteByUser(User user);
}
