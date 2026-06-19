package com.auth_service.auth_service.service;

import com.auth_service.auth_service.entity.RefreshToken;
import com.auth_service.auth_service.entity.User;
import com.auth_service.auth_service.repository.RefreshTokenRepo;
import com.auth_service.auth_service.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepo refreshTokenRepo;
    private final UserRepository userRepository;

    public RefreshTokenService(RefreshTokenRepo refreshTokenRepo, UserRepository userRepository) {
        this.refreshTokenRepo = refreshTokenRepo;
        this.userRepository = userRepository;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepo.findByToken(token);
    }

    @Transactional
    public RefreshToken createRefreshToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        RefreshToken refreshToken = refreshTokenRepo.findByUser(user)
                .orElseGet(() -> {
                    RefreshToken t = new RefreshToken();
                    t.setUser(user);
                    return t;
                });

        refreshToken.setToken(UUID.randomUUID().toString());
        // Expire in 30 days
        refreshToken.setExpirydate(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 30));

        return refreshTokenRepo.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpirydate().before(new Date())) {
            refreshTokenRepo.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }
}
