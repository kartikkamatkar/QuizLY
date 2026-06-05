package com.quizly.quizservice.mapper;

import com.quizly.quizservice.dto.QuizRequest;
import com.quizly.quizservice.dto.QuizResponse;
import com.quizly.quizservice.entity.Quiz;
import org.springframework.stereotype.Component;

@Component
public class QuizMapper {

    public Quiz toEntity(QuizRequest request) {

        Quiz quiz = new Quiz();

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setCategory(request.getCategory());
        quiz.setDifficulty(request.getDifficulty());
        quiz.setTimeLimit(request.getTimeLimit());

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

        return response;
    }
}