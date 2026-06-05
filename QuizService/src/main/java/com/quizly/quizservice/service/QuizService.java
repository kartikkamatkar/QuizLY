package com.quizly.quizservice.service;

import com.quizly.quizservice.dto.QuizRequest;
import com.quizly.quizservice.dto.QuizResponse;
import com.quizly.quizservice.entity.Quiz;
import com.quizly.quizservice.mapper.QuizMapper;
import com.quizly.quizservice.repository.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizMapper quizMapper;

    public QuizService(
            QuizRepository quizRepository,
            QuizMapper quizMapper) {

        this.quizRepository = quizRepository;
        this.quizMapper = quizMapper;
    }

    public QuizResponse createQuiz(
            QuizRequest request) {

        Quiz quiz =
                quizMapper.toEntity(request);

        Quiz savedQuiz =
                quizRepository.save(quiz);

        return quizMapper.toResponse(savedQuiz);
    }

    public List<QuizResponse> getAllQuizzes() {

        return quizRepository.findAll()
                .stream()
                .map(quizMapper::toResponse)
                .collect(Collectors.toList());
    }

    public QuizResponse getQuizById(Long id) {

        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Quiz not found"));

        return quizMapper.toResponse(quiz);
    }

    public void deleteQuiz(Long id) {

        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Quiz not found"));

        quizRepository.delete(quiz);
    }
}