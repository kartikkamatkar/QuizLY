package com.example.attemptservice.service;

import com.example.attemptservice.client.AuthServiceClient;
import com.example.attemptservice.dto.DashboardResponse;
import com.example.attemptservice.dto.LeaderboardResponse;
import com.example.attemptservice.dto.AttemptRequest;
import com.example.attemptservice.dto.AttemptResponse;
import com.example.attemptservice.entity.QuizAttempt;
import com.example.attemptservice.repository.QuizAttemptRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AttemptService {

    private final QuizAttemptRepository attemptRepository;
    private final LeaderboardCacheService leaderboardCacheService;
    private final AuthServiceClient authServiceClient;

    public AttemptService(QuizAttemptRepository attemptRepository, 
                          LeaderboardCacheService leaderboardCacheService,
                          AuthServiceClient authServiceClient) {
        this.attemptRepository = attemptRepository;
        this.leaderboardCacheService = leaderboardCacheService;
        this.authServiceClient = authServiceClient;
    }

    public AttemptResponse saveAttempt(AttemptRequest request) {

        QuizAttempt attempt = new QuizAttempt();

        attempt.setUserId(request.getUserId());
        attempt.setQuizId(request.getQuizId());
        attempt.setScore(request.getScore());
        attempt.setTotalQuestions(request.getTotalQuestions());
        attempt.setSubmittedAt(LocalDateTime.now());

        QuizAttempt savedAttempt = attemptRepository.save(attempt);

        // Update Redis real-time leaderboard cache
        try {
            leaderboardCacheService.updateScore(savedAttempt.getUserId(), (long) savedAttempt.getScore());
        } catch (Exception e) {
            System.err.println("Could not update leaderboard cache: " + e.getMessage());
        }

        AttemptResponse response = mapToResponse(savedAttempt);

        // Notify auth-service gamification via Feign (replaces Kafka)
        try {
            authServiceClient.processAttemptCompleted(Map.of(
                    "userId", response.getUserId(),
                    "score", response.getScore(),
                    "totalQuestions", response.getTotalQuestions()
            ));
        } catch (Exception e) {
            System.err.println("Could not notify auth-service gamification: " + e.getMessage());
        }

        return response;
    }

    public AttemptResponse getAttemptById(Long id) {

        QuizAttempt attempt = attemptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        return mapToResponse(attempt);
    }

    public List<AttemptResponse> getAttemptsByUserId(Long userId) {

        return attemptRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AttemptResponse> getAllAttempts() {

        return attemptRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteAttempt(Long id) {

        QuizAttempt attempt = attemptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        attemptRepository.delete(attempt);
    }

    private AttemptResponse mapToResponse(QuizAttempt attempt) {

        AttemptResponse response = new AttemptResponse();

        response.setId(attempt.getId());
        response.setUserId(attempt.getUserId());
        response.setQuizId(attempt.getQuizId());
        response.setScore(attempt.getScore());
        response.setTotalQuestions(attempt.getTotalQuestions());
        response.setSubmittedAt(attempt.getSubmittedAt());

        return response;
    }

    public List<LeaderboardResponse> getLeaderboard() {
        // Try fetching from Redis Cache first
        try {
            if (leaderboardCacheService.hasLeaderboard()) {
                return leaderboardCacheService.getTopLeaderboard(10);
            }
        } catch (Exception e) {
            System.err.println("Leaderboard cache lookup failed, falling back to DB: " + e.getMessage());
        }

        // Database fallback & cache priming
        List<LeaderboardResponse> dbLeaderboard = attemptRepository.getLeaderboard()
                .stream()
                .map(result -> {
                    LeaderboardResponse response = new LeaderboardResponse();
                    response.setUserId(((Number) result[0]).longValue());
                    response.setTotalScore(((Number) result[1]).longValue());
                    return response;
                })
                .toList();

        // Populate cache safely
        try {
            for (LeaderboardResponse entry : dbLeaderboard) {
                leaderboardCacheService.updateScore(entry.getUserId(), entry.getTotalScore());
            }
        } catch (Exception e) {
            System.err.println("Could not prime leaderboard cache: " + e.getMessage());
        }

        return dbLeaderboard;
    }

    public DashboardResponse getDashboard(Long userId) {

        List<QuizAttempt> attempts = attemptRepository.findByUserId(userId);

        DashboardResponse response = new DashboardResponse();

        response.setTotalAttempts((long) attempts.size());

        response.setHighestScore(
                attempts.stream()
                        .mapToInt(QuizAttempt::getScore)
                        .max()
                        .orElse(0));

        response.setAverageScore(
                attempts.stream()
                        .mapToInt(QuizAttempt::getScore)
                        .average()
                        .orElse(0));

        return response;
    }
}