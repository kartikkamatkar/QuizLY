package com.auth_service.auth_service.controller;

import com.auth_service.auth_service.entity.UserBadge;
import com.auth_service.auth_service.entity.UserGamification;
import com.auth_service.auth_service.service.GamificationService;
import org.springframework.http.HttpStatus;
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

    // Post new attempt stats (replaces Kafka message broker)
    @PostMapping("/attempt")
    public ResponseEntity<?> processAttemptCompleted(@RequestBody Map<String, Object> body) {
        Long userId = body.get("userId") != null ? ((Number) body.get("userId")).longValue() : null;
        Integer score = body.get("score") != null ? ((Number) body.get("score")).intValue() : null;
        Integer totalQuestions = body.get("totalQuestions") != null ? ((Number) body.get("totalQuestions")).intValue() : null;

        if (userId == null || score == null || totalQuestions == null) {
            return ResponseEntity.badRequest().body("Missing required parameters (userId, score, totalQuestions)");
        }

        try {
            UserGamification stats = gamificationService.processAttemptCompleted(userId, score, totalQuestions);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process gamification: " + e.getMessage());
        }
    }
}
