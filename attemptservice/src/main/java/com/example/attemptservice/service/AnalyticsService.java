package com.example.attemptservice.service;

import com.example.attemptservice.client.QuizServiceClient;
import com.example.attemptservice.entity.QuizAttempt;
import com.example.attemptservice.repository.QuizAttemptRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AnalyticsService {

    private final QuizAttemptRepository attemptRepository;
    private final QuizServiceClient quizServiceClient;

    public AnalyticsService(QuizAttemptRepository attemptRepository, QuizServiceClient quizServiceClient) {
        this.attemptRepository = attemptRepository;
        this.quizServiceClient = quizServiceClient;
    }

    public Map<String, Object> getWeakTopicsAndRecommendations(Long userId) {
        List<QuizAttempt> attempts = attemptRepository.findByUserId(userId);

        if (attempts.isEmpty()) {
            return Map.of(
                "userId", userId,
                "weakTopics", List.of(),
                "recommendations", List.of("Attempt your first quiz to generate personalized recommendations!")
            );
        }

        // Map to store topic scores: Topic -> List of quiz percentages
        Map<String, List<Double>> topicScores = new HashMap<>();

        for (QuizAttempt attempt : attempts) {
            double quizPercentage = ((double) attempt.getScore() / attempt.getTotalQuestions()) * 100.0;
            
            try {
                // Fetch questions for this quiz to extract topics
                List<Map<String, Object>> questions = quizServiceClient.getQuizQuestions(attempt.getQuizId());
                for (Map<String, Object> question : questions) {
                    String topic = (String) question.get("topic");
                    if (topic != null && !topic.trim().isEmpty()) {
                        topicScores.computeIfAbsent(topic.trim(), k -> new ArrayList<>()).add(quizPercentage);
                    }
                }
            } catch (Exception e) {
                System.err.println("Could not resolve topics for quiz ID " + attempt.getQuizId() + ": " + e.getMessage());
            }
        }

        List<Map<String, Object>> weakTopicsList = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        // Calculate average score per topic
        for (Map.Entry<String, List<Double>> entry : topicScores.entrySet()) {
            String topic = entry.getKey();
            List<Double> scores = entry.getValue();
            double average = scores.stream().mapToDouble(Double::doubleValue).average().orElse(100.0);

            // If average score on this topic is less than 65%, it's a weak topic
            if (average < 65.0) {
                weakTopicsList.add(Map.of(
                    "topic", topic,
                    "averagePercentage", Math.round(average * 100.0) / 100.0,
                    "attemptCount", scores.size()
                ));

                // Add personalized recommendations based on topic name
                String rec = getRecommendationForTopic(topic);
                if (!recommendations.contains(rec)) {
                    recommendations.add(rec);
                }
            }
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Great job! You are performing well across all topics. Try harder quizzes to keep growing!");
        }

        return Map.of(
            "userId", userId,
            "totalAttemptsCount", attempts.size(),
            "weakTopics", weakTopicsList,
            "recommendations", recommendations
        );
    }

    private String getRecommendationForTopic(String topic) {
        String lower = topic.toLowerCase();
        if (lower.contains("java") || lower.contains("oop")) {
            return "Java Core: Revise Garbage Collection algorithms, Multithreading Concurrency utilities, and Memory Models.";
        } else if (lower.contains("spring") || lower.contains("boot") || lower.contains("aop")) {
            return "Spring Boot: Study Dependency Injection mechanics, Auto-Configuration, and Aspect-Oriented Programming (AOP).";
        } else if (lower.contains("react") || lower.contains("state") || lower.contains("redux")) {
            return "React: Review State hook workflows, virtual DOM diffing, and frontend component lifecycle rendering.";
        } else if (lower.contains("dsa") || lower.contains("tree") || lower.contains("graph") || lower.contains("algorithm")) {
            return "DSA: Practice Tree traversals (DFS/BFS), Graph path-finding, and Dynamic Programming complexity analysis.";
        } else if (lower.contains("sql") || lower.contains("dbms") || lower.contains("query") || lower.contains("index")) {
            return "DBMS: Study database index lookups (B-Trees), query normalization, join execution plans, and transaction isolation levels.";
        }
        return "Topic '" + topic + "': Review the core reference docs, practice coding exercises, and attempt similar quizzes.";
    }
}
