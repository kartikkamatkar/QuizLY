package com.auth_service.auth_service.controller;

import com.auth_service.auth_service.entity.UserBadge;
import com.auth_service.auth_service.entity.UserGamification;
import com.auth_service.auth_service.service.GamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth/gamification")
public class GamificationController {

    private final GamificationService gamificationService;

    public GamificationController(GamificationService gamificationService) {
        this.gamificationService = gamificationService;
    }

    // Retrieve stats and badges for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserGamificationDetails(@PathVariable Long userId) {
        Optional<UserGamification> statsOpt = gamificationService.getUserGamification(userId);
        List<UserBadge> badges = gamificationService.getUserBadges(userId);

        if (statsOpt.isEmpty()) {
            // Return empty stats if user hasn't attempted any quizzes yet
            UserGamification emptyStats = new UserGamification();
            emptyStats.setUserId(userId);
            return ResponseEntity.ok(Map.of(
                "stats", emptyStats,
                "badges", List.of()
            ));
        }

        return ResponseEntity.ok(Map.of(
            "stats", statsOpt.get(),
            "badges", badges
        ));
    }
}
