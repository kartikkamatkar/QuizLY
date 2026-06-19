package com.quizly.aiservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class LearningPathRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Topic interest is required")
    @Size(min = 2, max = 150, message = "Topic interest must be between 2 and 150 characters")
    private String topicInterest;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTopicInterest() {
        return topicInterest;
    }

    public void setTopicInterest(String topicInterest) {
        this.topicInterest = topicInterest;
    }
}
