package com.auth_service.auth_service.repository;

import com.auth_service.auth_service.entity.UserGamification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserGamificationRepository extends JpaRepository<UserGamification, Long> {
    Optional<UserGamification> findByUserId(Long userId);
}
