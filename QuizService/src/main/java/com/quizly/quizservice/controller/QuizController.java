package com.quizly.quizservice.controller;

import com.quizly.quizservice.dto.*;
import com.quizly.quizservice.enums.Category;
import com.quizly.quizservice.enums.Difficulty;
import com.quizly.quizservice.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    // QUIZ APIs
    @PostMapping("/quizzes")
    public QuizResponse createQuiz(
            @Valid @RequestBody QuizRequest request,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {
        if (xUserRole == null || !"ADMIN".equalsIgnoreCase(xUserRole)) {
            throw new SecurityException("Unauthorized: Admin privilege required");
        }
        return quizService.createQuiz(request);
    }

    @GetMapping("/quizzes")
    public List<QuizResponse> getAllQuizzes() {
        return quizService.getAllQuizzes();
    }

    @GetMapping("/quizzes/{id}")
    public QuizResponse getQuizById(@PathVariable Long id) {
        return quizService.getQuizById(id);
    }

    @DeleteMapping("/quizzes/{id}")
    public String deleteQuiz(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {
        if (xUserRole == null || !"ADMIN".equalsIgnoreCase(xUserRole)) {
            throw new SecurityException("Unauthorized: Admin privilege required");
        }
        quizService.deleteQuiz(id);
        return "Quiz Deleted Successfully";
    }
    @PostMapping("/quizzes/{quizId}/questions/{questionId}")
    public String addQuestionToQuiz(
            @PathVariable Long quizId,
            @PathVariable Long questionId,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {
        if (xUserRole == null || !"ADMIN".equalsIgnoreCase(xUserRole)) {
            throw new SecurityException("Unauthorized: Admin privilege required");
        }

        quizService.addQuestionToQuiz(quizId, questionId);

        return "Question Added To Quiz";
    }

    @GetMapping("/quizzes/{quizId}/questions")
    public List<QuestionResponse> getQuizQuestions(@PathVariable Long quizId) {
        return quizService.getQuizQuestions(quizId);
    }

    @GetMapping("/quizzes/{id}/start")
    public StartQuizResponse startQuiz(@PathVariable Long id) {
        return quizService.startQuiz(id);
    }

    // QUESTION APIs
    @PostMapping("/questions")
    public QuestionResponse addQuestion(
            @Valid @RequestBody QuestionRequest request,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {
        if (xUserRole == null || !"ADMIN".equalsIgnoreCase(xUserRole)) {
            throw new SecurityException("Unauthorized: Admin privilege required");
        }
        return quizService.addQuestion(request);
    }

    @GetMapping("/questions")
    public Page<QuestionResponse> getAllQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return quizService.getAllQuestions(page, size);
    }

    @GetMapping("/questions/{id}")
    public QuestionResponse getQuestionById(@PathVariable Long id) {
        return quizService.getQuestionById(id);
    }

    @PutMapping("/questions/{id}")
    public QuestionResponse updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {
        if (xUserRole == null || !"ADMIN".equalsIgnoreCase(xUserRole)) {
            throw new SecurityException("Unauthorized: Admin privilege required");
        }
        return quizService.updateQuestion(id, request);
    }

    @DeleteMapping("/questions/{id}")
    public String deleteQuestion(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {
        if (xUserRole == null || !"ADMIN".equalsIgnoreCase(xUserRole)) {
            throw new SecurityException("Unauthorized: Admin privilege required");
        }
        quizService.deleteQuestion(id);
        return "Question Deleted Successfully";
    }

    @GetMapping("/questions/category/{category}")
    public List<QuestionResponse> getByCategory(@PathVariable Category category) {
        return quizService.getQuestionsByCategory(category);
    }

    @GetMapping("/questions/difficulty/{difficulty}")
    public List<QuestionResponse> getByDifficulty(@PathVariable Difficulty difficulty) {
        return quizService.getQuestionsByDifficulty(difficulty);
    }

    @GetMapping("/questions/quiz/{quizId}")
    public List<QuestionResponse> getQuestionsByQuizId(@PathVariable Long quizId) {
        return quizService.getQuestionsByQuizId(quizId);
    }

    @PostMapping("/quizzes/submit")
    public SubmitQuizResponse submitQuiz(
            @RequestBody SubmitQuizRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {

        if (xUserId != null && !xUserId.isEmpty()) {
            Long headerUserId = Long.valueOf(xUserId);
            if (!headerUserId.equals(request.getUserId())) {
                throw new SecurityException("Unauthorized: User ID mismatch (BOLA)");
            }
        } else {
            throw new SecurityException("Unauthorized: Missing user identification header");
        }

        return quizService.submitQuiz(request);
    }
}