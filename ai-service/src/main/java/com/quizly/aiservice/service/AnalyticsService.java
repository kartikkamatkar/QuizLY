package com.quizly.aiservice.service;

import com.quizly.aiservice.client.AttemptServiceClient;
import com.quizly.aiservice.client.QuizServiceClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AnalyticsService {

    private final AttemptServiceClient attemptServiceClient;
    private final QuizServiceClient quizServiceClient;
    private final ChatModel chatModel;

    public AnalyticsService(AttemptServiceClient attemptServiceClient,
                            QuizServiceClient quizServiceClient,
                            ChatModel chatModel) {
        this.attemptServiceClient = attemptServiceClient;
        this.quizServiceClient = quizServiceClient;
        this.chatModel = chatModel;
    }

    public Map<String, Object> getWeakTopicsAndRecommendations(Long userId) {
        List<Map<String, Object>> attempts = attemptServiceClient.getAttemptsByUserId(userId);

        if (attempts.isEmpty()) {
            return Map.of(
                "userId", userId,
                "weakTopics", List.of(),
                "recommendations", "No quiz attempts recorded yet. Attempt a quiz to generate personalized recommendations!"
            );
        }

        // Aggregate topic scores
        Map<String, List<Double>> topicScores = new HashMap<>();

        for (Map<String, Object> attempt : attempts) {
            Number scoreNum = (Number) attempt.get("score");
            Number totalQuestionsNum = (Number) attempt.get("totalQuestions");
            Number quizIdNum = (Number) attempt.get("quizId");

            if (scoreNum == null || totalQuestionsNum == null || quizIdNum == null) {
                continue;
            }

            double quizPercentage = (scoreNum.doubleValue() / totalQuestionsNum.doubleValue()) * 100.0;
            Long quizId = quizIdNum.longValue();

            try {
                List<Map<String, Object>> questions = quizServiceClient.getQuizQuestions(quizId);
                for (Map<String, Object> question : questions) {
                    String topic = (String) question.get("topic");
                    if (topic != null && !topic.trim().isEmpty()) {
                        topicScores.computeIfAbsent(topic.trim(), k -> new ArrayList<>()).add(quizPercentage);
                    }
                }
            } catch (Exception e) {
                System.err.println("Could not resolve questions for quiz ID " + quizId + ": " + e.getMessage());
            }
        }

        List<Map<String, Object>> weakTopics = new ArrayList<>();
        List<String> weakTopicNames = new ArrayList<>();

        for (Map.Entry<String, List<Double>> entry : topicScores.entrySet()) {
            String topic = entry.getKey();
            List<Double> scores = entry.getValue();
            double average = scores.stream().mapToDouble(Double::doubleValue).average().orElse(100.0);

            if (average < 65.0) {
                weakTopics.add(Map.of(
                    "topic", topic,
                    "averageScore", Math.round(average * 100.0) / 100.0,
                    "attemptCount", scores.size()
                ));
                weakTopicNames.add(topic);
            }
        }

        if (weakTopics.isEmpty()) {
            return Map.of(
                "userId", userId,
                "weakTopics", List.of(),
                "recommendations", "Splendid work! You've maintained high scores across all tested topics. Push yourself further by trying harder quizzes!"
            );
        }

        // Step C: Ask LLM to generate custom study plans for these weak topics
        String weakTopicsStr = String.join(", ", weakTopicNames);
        String promptText = """
                A student is using QuizLY, an enterprise quiz platform.
                Their performance has dropped (below 65%%) on these specific topics: %s.
                
                Generate a structured, actionable study advice outline (under 150 words) with:
                1. Core concepts they should review for these topics.
                2. Practical coding exercises or experiments.
                3. A word of encouragement.
                """.formatted(weakTopicsStr);

        Prompt prompt = new Prompt(promptText);
        String recommendations = chatModel.call(prompt).getResult().getOutput().getContent();

        return Map.of(
            "userId", userId,
            "totalAttemptsCount", attempts.size(),
            "weakTopics", weakTopics,
            "recommendations", recommendations
        );
    }
}
