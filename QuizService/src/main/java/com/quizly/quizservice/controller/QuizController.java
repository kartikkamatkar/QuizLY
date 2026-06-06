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
    public QuizResponse createQuiz(@RequestBody QuizRequest request) {
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
    public String deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return "Quiz Deleted Successfully";
    }
    @PostMapping("/quizzes/{quizId}/questions/{questionId}")
    public String addQuestionToQuiz(
            @PathVariable Long quizId,
            @PathVariable Long questionId) {

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
    public QuestionResponse addQuestion(@Valid @RequestBody QuestionRequest request) {
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
    public QuestionResponse updateQuestion(@PathVariable Long id, @Valid @RequestBody QuestionRequest request) {
        return quizService.updateQuestion(id, request);
    }

    @DeleteMapping("/questions/{id}")
    public String deleteQuestion(@PathVariable Long id) {
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
            @RequestBody SubmitQuizRequest request) {

        return quizService.submitQuiz(request);
    }
}