package com.example.attemptservice.service;

import com.example.attemptservice.dto.AttemptRequest;
import com.example.attemptservice.dto.AttemptResponse;
import com.example.attemptservice.entity.QuizAttempt;
import com.example.attemptservice.repository.QuizAttemptRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttemptService {

    private final QuizAttemptRepository attemptRepository;

    public AttemptService(QuizAttemptRepository attemptRepository) {
        this.attemptRepository = attemptRepository;
    }

    public AttemptResponse saveAttempt(AttemptRequest request) {

        QuizAttempt attempt = new QuizAttempt();

        attempt.setUserId(request.getUserId());
        attempt.setQuizId(request.getQuizId());
        attempt.setScore(request.getScore());
        attempt.setTotalQuestions(request.getTotalQuestions());
        attempt.setSubmittedAt(LocalDateTime.now());

        QuizAttempt savedAttempt =
                attemptRepository.save(attempt);

        return mapToResponse(savedAttempt);
    }

    public AttemptResponse getAttemptById(Long id) {

        QuizAttempt attempt = attemptRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Attempt not found"));

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
                .orElseThrow(() ->
                        new RuntimeException("Attempt not found"));

        attemptRepository.delete(attempt);
    }

    private AttemptResponse mapToResponse(
            QuizAttempt attempt) {

        AttemptResponse response =
                new AttemptResponse();

        response.setId(attempt.getId());
        response.setUserId(attempt.getUserId());
        response.setQuizId(attempt.getQuizId());
        response.setScore(attempt.getScore());
        response.setTotalQuestions(
                attempt.getTotalQuestions());
        response.setSubmittedAt(
                attempt.getSubmittedAt());

        return response;
    }
}