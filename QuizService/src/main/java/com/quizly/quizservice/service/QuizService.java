package com.quizly.quizservice.service;

import com.quizly.quizservice.dto.*;
import com.quizly.quizservice.entity.Question;
import com.quizly.quizservice.entity.Quiz;
import com.quizly.quizservice.enums.Category;
import com.quizly.quizservice.enums.Difficulty;
import com.quizly.quizservice.mapper.QuizMapper;
import com.quizly.quizservice.repository.QuestionRepository;
import com.quizly.quizservice.repository.QuizRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuizMapper quizMapper;
    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    public QuizService(
            QuizRepository quizRepository,
            QuizMapper quizMapper,
            QuestionRepository questionRepository) {

        this.quizRepository = quizRepository;
        this.quizMapper = quizMapper;
        this.questionRepository = questionRepository;
    }
    // Quiz methods
    public QuizResponse createQuiz(QuizRequest request) {
        Quiz quiz = quizMapper.toEntity(request);
        Quiz savedQuiz = quizRepository.save(quiz);
        return quizMapper.toResponse(savedQuiz);
    }

    public List<QuizResponse> getAllQuizzes() {
        return quizRepository.findAll().stream().map(quizMapper::toResponse).collect(Collectors.toList());
    }

    public QuizResponse getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id).orElseThrow(() -> new RuntimeException("Quiz not found"));
        return quizMapper.toResponse(quiz);
    }

    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id).orElseThrow(() -> new RuntimeException("Quiz not found"));
        quizRepository.delete(quiz);
    }
    public StartQuizResponse startQuiz(Long quizId) {

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() ->
                        new RuntimeException("Quiz not found"));

        List<QuestionResponse> questions =
                questionRepository.findByQuizId(quizId)
                        .stream()
                        .map(quizMapper::toResponse)
                        .toList();

        StartQuizResponse response =
                new StartQuizResponse();

        response.setQuizId(quiz.getId());
        response.setTitle(quiz.getTitle());
        response.setQuestions(questions);

        return response;
    }

    // Question methods
    public QuestionResponse addQuestion(QuestionRequest request) {
        Question question = quizMapper.toEntity(request);
        Question savedQuestion = questionRepository.save(question);
        return quizMapper.toResponse(savedQuestion);
    }

    public Page<QuestionResponse> getAllQuestions(int page, int size) {
        return questionRepository.findAll(PageRequest.of(page, size)).map(quizMapper::toResponse);
    }

    public QuestionResponse getQuestionById(Long id) {
        Question question = questionRepository.findById(id).orElseThrow(() -> new RuntimeException("Question not found"));
        return quizMapper.toResponse(question);
    }

    public List<QuestionResponse> getQuestionsByCategory(Category category) {
        return questionRepository.findByCategory(category).stream().map(quizMapper::toResponse).toList();
    }

    public List<QuestionResponse> getQuestionsByDifficulty(Difficulty difficulty) {
        return questionRepository.findByDifficulty(difficulty).stream().map(quizMapper::toResponse).toList();
    }

    public List<QuestionResponse> getQuestionsByQuizId(Long quizId) {
        return questionRepository.findByQuizId(quizId).stream().map(quizMapper::toResponse).toList();
    }

    public QuestionResponse updateQuestion(Long id, QuestionRequest request) {
        Question question = questionRepository.findById(id).orElseThrow(() -> new RuntimeException("Question not found"));
        question.setQuestion(request.getQuestion());
        question.setOptionA(request.getOptionA());
        question.setOptionB(request.getOptionB());
        question.setOptionC(request.getOptionC());
        question.setOptionD(request.getOptionD());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setTopic(request.getTopic());
        question.setCategory(request.getCategory());
        question.setDifficulty(request.getDifficulty());
        Question updatedQuestion = questionRepository.save(question);
        return quizMapper.toResponse(updatedQuestion);
    }

    public void deleteQuestion(Long id) {
        Question question = questionRepository.findById(id).orElseThrow(() -> new RuntimeException("Question not found"));
        questionRepository.delete(question);
    }
    public void addQuestionToQuiz(
            Long quizId,
            Long questionId) {

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() ->
                        new RuntimeException("Quiz not found"));

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() ->
                        new RuntimeException("Question not found"));

        question.setQuiz(quiz);

        questionRepository.save(question);
    }
    public List<QuestionResponse> getQuizQuestions(
            Long quizId) {

        return questionRepository
                .findByQuizId(quizId)
                .stream()
                .map(quizMapper::toResponse)
                .toList();
    }
    public SubmitQuizResponse submitQuiz(
            SubmitQuizRequest request) {

        List<Question> questions =
                questionRepository.findByQuizId(
                        request.getQuizId());

        int score = 0;

        for (Question question : questions) {

            String userAnswer =
                    request.getAnswers()
                            .get(question.getId());

            if (userAnswer != null &&
                    userAnswer.equalsIgnoreCase(
                            question.getCorrectAnswer())) {

                score++;
            }
        }

        SubmitQuizResponse response =
                new SubmitQuizResponse();

        response.setScore(score);
        response.setTotalQuestions(
                questions.size());

        double percentage =
                ((double) score /
                        questions.size()) * 100;

        response.setPercentage(percentage);

        return response;
    }

}