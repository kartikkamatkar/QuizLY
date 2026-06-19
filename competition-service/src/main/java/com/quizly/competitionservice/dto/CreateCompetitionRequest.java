package com.quizly.competitionservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateCompetitionRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Question count is required")
    @Min(value = 1, message = "Minimum 1 question required")
    @Max(value = 100, message = "Maximum 100 questions allowed")
    private Integer questionCount;

    @NotNull(message = "Time limit is required")
    @Min(value = 5, message = "Minimum time limit is 5 seconds")
    @Max(value = 300, message = "Maximum time limit is 300 seconds")
    private Integer timeLimit;

    @NotNull(message = "Host User ID is required")
    private Long hostUserId;

    @NotBlank(message = "Host User Name is required")
    private String hostUserName;

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(Integer questionCount) {
        this.questionCount = questionCount;
    }

    public Integer getTimeLimit() {
        return timeLimit;
    }

    public void setTimeLimit(Integer timeLimit) {
        this.timeLimit = timeLimit;
    }

    public Long getHostUserId() {
        return hostUserId;
    }

    public void setHostUserId(Long hostUserId) {
        this.hostUserId = hostUserId;
    }

    public String getHostUserName() {
        return hostUserName;
    }

    public void setHostUserName(String hostUserName) {
        this.hostUserName = hostUserName;
    }
}
