package com.example.attemptservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "quiz-service", fallback = QuizServiceClientFallback.class)
public interface QuizServiceClient {

    @GetMapping("/api/quizzes/{quizId}/questions")
    List<Map<String, Object>> getQuizQuestions(@PathVariable("quizId") Long quizId);
}
