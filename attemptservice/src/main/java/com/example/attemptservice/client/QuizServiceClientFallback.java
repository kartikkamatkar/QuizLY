package com.example.attemptservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class QuizServiceClientFallback implements QuizServiceClient {

    private static final Logger log = LoggerFactory.getLogger(QuizServiceClientFallback.class);

    @Override
    public List<Map<String, Object>> getQuizQuestions(Long quizId) {
        log.error("Quiz Service is down! Could not fetch questions for quiz ID: {}", quizId);
        return List.of(); // Return empty list
    }
}
