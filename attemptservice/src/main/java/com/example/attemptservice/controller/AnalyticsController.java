package com.example.attemptservice.controller;

import com.example.attemptservice.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/attempts/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // Expose endpoint to retrieve personalized recommendations and weak topics
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserAnalytics(
            @PathVariable Long userId,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {

        if (xUserId != null && !xUserId.isEmpty()) {
            Long headerUserId = Long.valueOf(xUserId);
            boolean isAdmin = "ADMIN".equalsIgnoreCase(xUserRole);
            if (!headerUserId.equals(userId) && !isAdmin) {
                throw new SecurityException("Unauthorized: Access denied to this analytics dashboard (BOLA)");
            }
        } else {
            throw new SecurityException("Unauthorized: Missing user identification header");
        }

        Map<String, Object> result = analyticsService.getWeakTopicsAndRecommendations(userId);
        return ResponseEntity.ok(result);
    }
}
