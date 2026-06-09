package com.auth_service.auth_service.listener;

import com.auth_service.auth_service.service.GamificationService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AttemptEventListener {

    private final GamificationService gamificationService;

    public AttemptEventListener(GamificationService gamificationService) {
        this.gamificationService = gamificationService;
    }

    // Listen for attempt completion events published from attempt-service
    @KafkaListener(topics = "quiz-attempted", groupId = "quizly-auth-group")
    public void handleQuizAttempted(Map<String, Object> event) {
        try {
            System.out.println("Received quiz-attempted event: " + event);
            
            Long userId = event.get("userId") != null ? ((Number) event.get("userId")).longValue() : null;
            Integer score = event.get("score") != null ? ((Number) event.get("score")).intValue() : null;
            Integer totalQuestions = event.get("totalQuestions") != null ? ((Number) event.get("totalQuestions")).intValue() : null;

            if (userId != null && score != null && totalQuestions != null) {
                gamificationService.processAttemptCompleted(userId, score, totalQuestions);
            }
        } catch (Exception e) {
            System.err.println("Error consuming quiz-attempted event: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
