package com.quizly.quizservice.controller;

import com.quizly.quizservice.dto.QuestionRequest;
import com.quizly.quizservice.entity.Question;
import com.quizly.quizservice.entity.Quiz;
import com.quizly.quizservice.repository.QuestionRepository;
import com.quizly.quizservice.repository.QuizRepository;
import com.quizly.quizservice.service.AiService;
import com.quizly.quizservice.service.VectorSearchService;
import org.springframework.ai.document.Document;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
public class AiQuizController {

    private final AiService aiService;
    private final VectorSearchService vectorSearchService;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;

    public AiQuizController(AiService aiService,
                            VectorSearchService vectorSearchService,
                            QuizRepository quizRepository,
                            QuestionRepository questionRepository) {
        this.aiService = aiService;
        this.vectorSearchService = vectorSearchService;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
    }

    // 1. Generate an entire Quiz using AI and index the questions in Qdrant
    @PostMapping("/quiz-generate")
    public ResponseEntity<?> generateQuiz(@RequestBody Map<String, Object> body) {
        try {
            String topic = (String) body.get("topic");
            String category = (String) body.get("category");
            String difficulty = (String) body.get("difficulty");
            Integer questionCount = (Integer) body.get("questionCount");
            String title = (String) body.get("title");

            if (topic == null || category == null || difficulty == null || title == null) {
                return ResponseEntity.badRequest().body("Missing required parameters (topic, category, difficulty, title)");
            }

            int count = questionCount != null ? questionCount : 5;

            // Step A: Create and Save the Quiz
            Quiz quiz = new Quiz();
            quiz.setTitle(title);
            Quiz savedQuiz = quizRepository.save(quiz);

            // Step B: Generate Questions from Spring AI
            List<QuestionRequest> questionsReq = aiService.generateQuestions(topic, category, difficulty, count);
            List<Question> savedQuestions = new ArrayList<>();

            for (QuestionRequest req : questionsReq) {
                Question q = new Question();
                q.setQuestion(req.getQuestion());
                q.setOptionA(req.getOptionA());
                q.setOptionB(req.getOptionB());
                q.setOptionC(req.getOptionC());
                q.setOptionD(req.getOptionD());
                q.setCorrectAnswer(req.getCorrectAnswer());
                q.setTopic(req.getTopic());
                q.setCategory(req.getCategory());
                q.setDifficulty(req.getDifficulty());
                q.setQuiz(savedQuiz);

                Question savedQ = questionRepository.save(q);
                savedQuestions.add(savedQ);

                // Step C: Index question into Vector Store for semantic search
                try {
                    vectorSearchService.addQuestion(savedQ);
                } catch (Exception ve) {
                    System.err.println("Could not index question in Vector DB: " + ve.getMessage());
                }
            }

            return ResponseEntity.ok(Map.of(
                "quizId", savedQuiz.getId(),
                "title", savedQuiz.getTitle(),
                "questions", savedQuestions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("AI Quiz Generation failed: " + e.getMessage());
        }
    }

    // 2. Explain a specific question answer using AI
    @GetMapping("/explain/{questionId}")
    public ResponseEntity<?> explainAnswer(@PathVariable Long questionId) {
        Optional<Question> qOpt = questionRepository.findById(questionId);
        if (qOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Question not found");
        }

        Question q = qOpt.get();
        String options = "A: " + q.getOptionA() + ", B: " + q.getOptionB() + ", C: " + q.getOptionC() + ", D: " + q.getOptionD();
        
        try {
            String explanation = aiService.explainAnswer(q.getQuestion(), q.getCorrectAnswer(), options);
            return ResponseEntity.ok(Map.of(
                "questionId", questionId,
                "question", q.getQuestion(),
                "correctAnswer", q.getCorrectAnswer(),
                "explanation", explanation
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to generate AI explanation: " + e.getMessage());
        }
    }

    // 3. Semantic similarity search across indexed questions
    @GetMapping("/questions/search")
    public ResponseEntity<?> semanticSearch(@RequestParam String query, @RequestParam(defaultValue = "5") int limit) {
        try {
            List<Document> matchedDocs = vectorSearchService.searchQuestions(query, limit);
            return ResponseEntity.ok(matchedDocs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Semantic search failed: " + e.getMessage());
        }
    }
}
