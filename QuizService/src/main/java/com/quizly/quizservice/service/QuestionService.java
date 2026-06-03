package com.quizly.quizservice.service;

import com.quizly.quizservice.dto.QuestionRequest;
import com.quizly.quizservice.dto.QuestionResponse;
import com.quizly.quizservice.entity.Question;
import com.quizly.quizservice.enums.Category;
import com.quizly.quizservice.enums.Difficulty;
import com.quizly.quizservice.mapper.QuestionMapper;
import com.quizly.quizservice.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionMapper questionMapper;

    public QuestionService(
            QuestionRepository questionRepository,
            QuestionMapper questionMapper) {

        this.questionRepository = questionRepository;
        this.questionMapper = questionMapper;
    }

    public QuestionResponse addQuestion(QuestionRequest request) {

        Question question = questionMapper.toEntity(request);

        Question savedQuestion = questionRepository.save(question);

        return questionMapper.toResponse(savedQuestion);
    }

    public List<QuestionResponse> getAllQuestions() {

        return questionRepository.findAll()
                .stream()
                .map(questionMapper::toResponse)
                .collect(Collectors.toList());
    }

    public QuestionResponse getQuestionById(Long id) {

        Question question = questionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Question not found"));

        return questionMapper.toResponse(question);
    }

    public List<QuestionResponse> getQuestionsByCategory(
            Category category) {

        return questionRepository.findByCategory(category)
                .stream()
                .map(questionMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<QuestionResponse> getQuestionsByDifficulty(
            Difficulty difficulty) {

        return questionRepository.findByDifficulty(difficulty)
                .stream()
                .map(questionMapper::toResponse)
                .collect(Collectors.toList());
    }

    public QuestionResponse updateQuestion(
            Long id,
            QuestionRequest request) {

        Question question = questionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Question not found"));

        question.setQuestion(request.getQuestion());
        question.setOptionA(request.getOptionA());
        question.setOptionB(request.getOptionB());
        question.setOptionC(request.getOptionC());
        question.setOptionD(request.getOptionD());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setTopic(request.getTopic());
        question.setCategory(request.getCategory());
        question.setDifficulty(request.getDifficulty());

        Question updatedQuestion =
                questionRepository.save(question);

        return questionMapper.toResponse(updatedQuestion);
    }

    public void deleteQuestion(Long id) {

        Question question = questionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Question not found"));

        questionRepository.delete(question);
    }
}