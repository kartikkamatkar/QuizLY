package com.quizly.aiservice.controller;

import com.quizly.aiservice.dto.ChatRequest;
import com.quizly.aiservice.dto.ExplanationRequest;
import com.quizly.aiservice.dto.LearningPathRequest;
import com.quizly.aiservice.service.AiExplanationService;
import com.quizly.aiservice.service.AiLearningAssistantService;
import com.quizly.aiservice.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    private final AiExplanationService explanationService;
    private final AiLearningAssistantService learningAssistantService;
    private final AnalyticsService analyticsService;

    public AiAssistantController(AiExplanationService explanationService,
                                 AiLearningAssistantService learningAssistantService,
                                 AnalyticsService analyticsService) {
        this.explanationService = explanationService;
        this.learningAssistantService = learningAssistantService;
        this.analyticsService = analyticsService;
    }

    // 1. Generate explanation for an answer selection
    @PostMapping("/explain")
    public ResponseEntity<?> explainAnswer(@RequestBody ExplanationRequest request) {
        try {
            String explanation = explanationService.explainAnswer(request);
            return ResponseEntity.ok(Map.of("explanation", explanation));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Explanation generation failed: " + e.getMessage());
        }
    }

    // 2. Chatbot Learning Assistant (RAG context-aware chat)
    @PostMapping("/chat")
    public ResponseEntity<?> askAssistant(@RequestBody ChatRequest request) {
        try {
            String response = learningAssistantService.askAssistant(request.getUserId(), request.getMessage());
            return ResponseEntity.ok(Map.of(
                "userId", request.getUserId(),
                "response", response
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Assistant query failed: " + e.getMessage());
        }
    }

    // 3. Generate a structured learning timeline
    @PostMapping("/learning-path")
    public ResponseEntity<?> generateLearningPath(@RequestBody LearningPathRequest request) {
        try {
            String timeline = learningAssistantService.generateLearningPath(request.getUserId(), request.getTopicInterest());
            return ResponseEntity.ok(Map.of(
                "userId", request.getUserId(),
                "topicInterest", request.getTopicInterest(),
                "learningPath", timeline
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to generate learning path: " + e.getMessage());
        }
    }

    // 4. Scrapes user attempts history to calculate weak topics and dynamic recommendations
    @GetMapping("/analytics/recommendations/{userId}")
    public ResponseEntity<?> getRecommendations(@PathVariable Long userId) {
        try {
            Map<String, Object> results = analyticsService.getWeakTopicsAndRecommendations(userId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to compute recommendations: " + e.getMessage());
        }
    }
}
