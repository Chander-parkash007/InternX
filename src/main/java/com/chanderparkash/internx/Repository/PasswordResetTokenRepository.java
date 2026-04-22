package com.chanderparkash.internx.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chanderparkash.internx.Entities.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);
}
