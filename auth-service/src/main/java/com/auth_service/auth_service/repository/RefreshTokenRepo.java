package com.auth_service.auth_service.repository;

import com.auth_service.auth_service.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken, Long>
{
    Optional<RefreshToken> findByToken(String token);
}
