package com.auth_service.auth_service.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_gamification")
public class UserGamification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    @Column(name = "current_xp")
    private Long currentXp = 0L;

    @Column(name = "current_level")
    private Integer currentLevel = 1;

    @Column(name = "current_streak")
    private Integer currentStreak = 0;

    @Column(name = "last_attempt_date")
    private LocalDate lastAttemptDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getCurrentXp() {
        return currentXp;
    }

    public void setCurrentXp(Long currentXp) {
        this.currentXp = currentXp;
    }

    public Integer getCurrentLevel() {
        return currentLevel;
    }

    public void setCurrentLevel(Integer currentLevel) {
        this.currentLevel = currentLevel;
    }

    public Integer getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(Integer currentStreak) {
        this.currentStreak = currentStreak;
    }

    public LocalDate getLastAttemptDate() {
        return lastAttemptDate;
    }

    public void setLastAttemptDate(LocalDate lastAttemptDate) {
        this.lastAttemptDate = lastAttemptDate;
    }
}
