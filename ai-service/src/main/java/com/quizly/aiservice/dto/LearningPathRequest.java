package com.quizly.aiservice.dto;

public class LearningPathRequest {
    private Long userId;
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
