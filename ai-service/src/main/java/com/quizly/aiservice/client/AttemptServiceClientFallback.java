package com.quizly.aiservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class AttemptServiceClientFallback implements AttemptServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AttemptServiceClientFallback.class);

    @Override
    public List<Map<String, Object>> getAttemptsByUserId(Long userId, String xUserId, String xUserRole) {
        log.error("Attempt Service is down! Fallback returning empty list for user ID: {}", userId);
        return List.of();
    }
}
