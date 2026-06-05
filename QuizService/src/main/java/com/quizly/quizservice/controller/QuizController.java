package com.quizly.quizservice.controller;

import com.quizly.quizservice.dto.QuizRequest;
import com.quizly.quizservice.dto.QuizResponse;
import com.quizly.quizservice.service.QuizService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(
            QuizService quizService) {

        this.quizService = quizService;
    }

    @PostMapping
    public QuizResponse createQuiz(
            @RequestBody QuizRequest request) {

        return quizService.createQuiz(request);
    }

    @GetMapping
    public List<QuizResponse> getAllQuizzes() {

        return quizService.getAllQuizzes();
    }

    @GetMapping("/{id}")
    public QuizResponse getQuizById(
            @PathVariable Long id) {

        return quizService.getQuizById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteQuiz(
            @PathVariable Long id) {

        quizService.deleteQuiz(id);

        return "Quiz Deleted Successfully";
    }
}