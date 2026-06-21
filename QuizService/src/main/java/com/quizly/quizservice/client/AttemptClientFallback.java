package com.quizly.quizservice.client;

import com.quizly.quizservice.dto.AttemptRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class AttemptClientFallback implements AttemptClient {

    private static final Logger log = LoggerFactory.getLogger(AttemptClientFallback.class);

    @Override
    public Object saveAttempt(AttemptRequest attemptRequest, String xUserId) {
        log.error("Attempt Service is down or timed out! Fallback triggered for saving user ID: {}, quiz ID: {}", 
                attemptRequest.getUserId(), attemptRequest.getQuizId());
        
        // Return a mock / fallback response structure
        return "Fallback response: Attempt was not saved because the attempt service is unavailable.";
    }
}
