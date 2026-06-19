package com.quizly.aiservice.controller;

import com.quizly.aiservice.dto.AiQuizRequest;
import com.quizly.aiservice.dto.QuestionDto;
import com.quizly.aiservice.service.AiQuizGeneratorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/quiz")
public class AiQuizController {

    private final AiQuizGeneratorService quizGeneratorService;

    public AiQuizController(AiQuizGeneratorService quizGeneratorService) {
        this.quizGeneratorService = quizGeneratorService;
    }

    // 1. Generate quiz questions on a specific topic
    @PostMapping("/generate")
    public ResponseEntity<?> generateQuiz(
            @Valid @RequestBody AiQuizRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {
        if (xUserId == null || xUserId.isEmpty()) {
            throw new SecurityException("Unauthorized: Missing user identification header");
        }
        try {
            int count = request.getQuestionCount() != null ? request.getQuestionCount() : 5;
            List<QuestionDto> questions = quizGeneratorService.generateQuiz(
                request.getTopic(),
                request.getCategory(),
                request.getDifficulty(),
                count
            );
            return ResponseEntity.ok(Map.of(
                "title", request.getTitle(),
                "topic", request.getTopic(),
                "category", request.getCategory(),
                "difficulty", request.getDifficulty(),
                "questions", questions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Quiz generation failed: " + e.getMessage());
        }
    }

    // 2. Upload PDF study material and generate questions parsed from it
    @PostMapping("/generate-from-pdf")
    public ResponseEntity<?> generateFromPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("topic") String topic,
            @RequestParam("category") String category,
            @RequestParam("difficulty") String difficulty,
            @RequestParam(value = "questionCount", defaultValue = "5") int questionCount,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {
        
        if (xUserId == null || xUserId.isEmpty()) {
            throw new SecurityException("Unauthorized: Missing user identification header");
        }
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("PDF file is empty!");
            }
            // Strict PDF validation checks
            String contentType = file.getContentType();
            if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
                return ResponseEntity.badRequest().body("Unsafe file upload: Content-Type must be application/pdf");
            }
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
                return ResponseEntity.badRequest().body("Unsafe file upload: Filename must end with .pdf");
            }
            // Size limit: 10MB
            long maxBytes = 10 * 1024 * 1024;
            if (file.getSize() > maxBytes) {
                return ResponseEntity.badRequest().body("Unsafe file upload: File size exceeds the maximum limit of 10MB");
            }

            List<QuestionDto> questions = quizGeneratorService.generateQuizFromPdf(
                file.getBytes(),
                topic,
                category,
                difficulty,
                questionCount
            );
            return ResponseEntity.ok(Map.of(
                "title", title,
                "topic", topic,
                "category", category,
                "difficulty", difficulty,
                "questions", questions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to generate quiz from PDF: " + e.getMessage());
        }
    }

    // 3. Evaluate difficulty of a question text
    @PostMapping("/evaluate-difficulty")
    public ResponseEntity<?> evaluateDifficulty(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {
        if (xUserId == null || xUserId.isEmpty()) {
            throw new SecurityException("Unauthorized: Missing user identification header");
        }
        String question = body.get("question");
        String options = body.get("options");

        if (question == null || options == null) {
            return ResponseEntity.badRequest().body("Missing question or options parameter");
        }

        try {
            String difficulty = quizGeneratorService.evaluateDifficulty(question, options);
            return ResponseEntity.ok(Map.of(
                "question", question,
                "options", options,
                "difficulty", difficulty
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Difficulty evaluation failed: " + e.getMessage());
        }
    }
}
