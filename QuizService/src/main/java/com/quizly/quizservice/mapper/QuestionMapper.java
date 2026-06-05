package com.quizly.quizservice.mapper;

import com.quizly.quizservice.dto.QuestionRequest;
import com.quizly.quizservice.dto.QuestionResponse;
import com.quizly.quizservice.entity.Question;
import org.springframework.stereotype.Component;

@Component
public class QuestionMapper {

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