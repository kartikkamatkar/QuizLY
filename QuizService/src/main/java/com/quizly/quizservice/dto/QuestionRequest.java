package com.quizly.quizservice.dto;

import com.quizly.quizservice.enums.Category;
import com.quizly.quizservice.enums.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class QuestionRequest {

    @NotBlank(message = "Question cannot be empty")
    private String question;

    @NotBlank(message = "Option A cannot be empty")
    private String optionA;

    @NotBlank(message = "Option B cannot be empty")
    private String optionB;

    @NotBlank(message = "Option C cannot be empty")
    private String optionC;

    @NotBlank(message = "Option D cannot be empty")
    private String optionD;

    @NotBlank(message = "Correct Answer cannot be empty")
    private String correctAnswer;

    @NotBlank(message = "Topic cannot be empty")
    private String topic;

    @NotNull(message = "Category is required")
    private Category category;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getOptionA() {
        return optionA;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }
}