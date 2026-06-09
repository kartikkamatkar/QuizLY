package com.example.attemptservice.controller;

import com.example.attemptservice.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<?> getUserAnalytics(@PathVariable Long userId) {
        Map<String, Object> result = analyticsService.getWeakTopicsAndRecommendations(userId);
        return ResponseEntity.ok(result);
    }
}
