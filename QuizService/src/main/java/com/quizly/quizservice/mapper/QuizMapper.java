package com.quizly.quizservice.mapper;

import com.quizly.quizservice.dto.QuestionRequest;
import com.quizly.quizservice.dto.QuestionResponse;
import com.quizly.quizservice.dto.QuizRequest;
import com.quizly.quizservice.dto.QuizResponse;
import com.quizly.quizservice.entity.Question;
import com.quizly.quizservice.entity.Quiz;
import org.springframework.stereotype.Component;

@Component
public class QuizMapper {

    // =========================
    // QUIZ MAPPING
    // =========================

    public Quiz toEntity(QuizRequest request) {

        Quiz quiz = new Quiz();

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setCategory(request.getCategory());
        quiz.setDifficulty(request.getDifficulty());
        quiz.setTimeLimit(request.getTimeLimit());
        quiz.setPdfUrl(request.getPdfUrl());

        return quiz;
    }

    public QuizResponse toResponse(Quiz quiz) {

        QuizResponse response = new QuizResponse();

        response.setId(quiz.getId());
        response.setTitle(quiz.getTitle());
        response.setDescription(quiz.getDescription());
        response.setCategory(quiz.getCategory());
        response.setDifficulty(quiz.getDifficulty());
        response.setTimeLimit(quiz.getTimeLimit());
        response.setPdfUrl(quiz.getPdfUrl());

        return response;
    }

    // =========================
    // QUESTION MAPPING
    // =========================

    public Question toEntity(QuestionRequest request) {

        Question question = new Question();

        question.setQuestion(request.getQuestion());
        question.setOptionA(request.getOptionA());
        question.setOptionB(request.getOptionB());
        question.setOptionC(request.getOptionC());
        question.setOptionD(request.getOptionD());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setTopic(request.getTopic());

        question.setCategory(request.getCategory());
        question.setDifficulty(request.getDifficulty());

        return question;
    }

    public QuestionResponse toResponse(Question question) {

        QuestionResponse response = new QuestionResponse();

        response.setId(question.getId());
        response.setQuestion(question.getQuestion());
        response.setOptionA(question.getOptionA());
        response.setOptionB(question.getOptionB());
        response.setOptionC(question.getOptionC());
        response.setOptionD(question.getOptionD());
        response.setTopic(question.getTopic());
        response.setCategory(question.getCategory());
        response.setDifficulty(question.getDifficulty());

        return response;
    }
}