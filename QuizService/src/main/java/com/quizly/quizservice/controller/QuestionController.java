package com.quizly.quizservice.controller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.quizly.quizservice.dto.QuestionRequest;
import com.quizly.quizservice.dto.QuestionResponse;
import com.quizly.quizservice.enums.Category;
import com.quizly.quizservice.enums.Difficulty;
import com.quizly.quizservice.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/quiz/{quizId}")
    public List<QuestionResponse> getQuestionsByQuizId(
            @PathVariable Long quizId) {

        return questionService
                .getQuestionsByQuizId(quizId);
    }
    @PostMapping
    public QuestionResponse addQuestion(
            @Valid @RequestBody QuestionRequest request) {
        return questionService.addQuestion(request);
    }

    @GetMapping
    public Page<QuestionResponse> getAllQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return questionService
                .getAllQuestions(page, size);
    }

    @GetMapping("/{id}")
    public QuestionResponse getQuestionById(@PathVariable Long id) {
        return questionService.getQuestionById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return "Question Deleted Successfully";
    }

    @GetMapping("/category/{category}")
    public List<QuestionResponse> getByCategory(
            @PathVariable Category category) {

        return questionService.getQuestionsByCategory(category);
    }

    @GetMapping("/difficulty/{difficulty}")
    public List<QuestionResponse> getByDifficulty(
            @PathVariable Difficulty difficulty) {

        return questionService.getQuestionsByDifficulty(difficulty);
    }

    @PutMapping("/{id}")
    public QuestionResponse updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request) {

        return questionService.updateQuestion(id, request);
    }
}