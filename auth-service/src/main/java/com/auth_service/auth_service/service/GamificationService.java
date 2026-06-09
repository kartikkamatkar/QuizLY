package com.auth_service.auth_service.service;

import com.auth_service.auth_service.entity.Badge;
import com.auth_service.auth_service.entity.UserBadge;
import com.auth_service.auth_service.entity.UserGamification;
import com.auth_service.auth_service.repository.BadgeRepository;
import com.auth_service.auth_service.repository.UserBadgeRepository;
import com.auth_service.auth_service.repository.UserGamificationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GamificationService {

    private final UserGamificationRepository gamificationRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

    public GamificationService(UserGamificationRepository gamificationRepository,
                               BadgeRepository badgeRepository,
                               UserBadgeRepository userBadgeRepository) {
        this.gamificationRepository = gamificationRepository;
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
    }

    // Initialize badges automatically in the database on service startup
    @PostConstruct
    public void initBadges() {
        if (badgeRepository.count() == 0) {
            badgeRepository.save(new Badge("First Step", "Completed your first quiz attempt!", "badge_first_step.png"));
            badgeRepository.save(new Badge("Streak Starter", "Achieved a 3-day daily streak!", "badge_streak_3.png"));
            badgeRepository.save(new Badge("Master Climber", "Reached Level 5 in progression!", "badge_level_5.png"));
        }
    }

    @Transactional
    public UserGamification processAttemptCompleted(Long userId, int score, int totalQuestions) {
        UserGamification stats = gamificationRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserGamification newStats = new UserGamification();
                    newStats.setUserId(userId);
                    return gamificationRepository.save(newStats);
                });

        // 1. Calculate XP Awarded: 10 XP per correct question
        long xpGained = score * 10L;
        long totalXp = stats.getCurrentXp() + xpGained;
        stats.setCurrentXp(totalXp);

        // 2. Level Up Calculation: XP needed for next level = currentLevel * 100
        int level = stats.getCurrentLevel();
        long xpNeeded = level * 100L;
        while (totalXp >= xpNeeded) {
            totalXp -= xpNeeded;
            level++;
            xpNeeded = level * 100L;
        }
        stats.setCurrentLevel(level);
        stats.setCurrentXp(totalXp);

        // 3. Streak Calculation
        LocalDate today = LocalDate.now();
        LocalDate lastDate = stats.getLastAttemptDate();

        if (lastDate == null) {
            stats.setCurrentStreak(1);
        } else {
            if (lastDate.equals(today.minusDays(1))) {
                stats.setCurrentStreak(stats.getCurrentStreak() + 1);
            } else if (lastDate.isBefore(today.minusDays(1))) {
                stats.setCurrentStreak(1); // Streak broken, reset
            }
            // If lastDate is today, streak stays unchanged
        }
        stats.setLastAttemptDate(today);

        UserGamification savedStats = gamificationRepository.save(stats);

        // 4. Process Badge unlocking conditions
        checkAndUnlockBadges(userId, savedStats);

        return savedStats;
    }

    private void checkAndUnlockBadges(Long userId, UserGamification stats) {
        // Rule A: First Step
        unlockBadgeIfEligible(userId, "First Step");

        // Rule B: Streak Starter
        if (stats.getCurrentStreak() >= 3) {
            unlockBadgeIfEligible(userId, "Streak Starter");
        }

        // Rule C: Master Climber
        if (stats.getCurrentLevel() >= 5) {
            unlockBadgeIfEligible(userId, "Master Climber");
        }
    }

    private void unlockBadgeIfEligible(Long userId, String badgeName) {
        Optional<Badge> badgeOpt = badgeRepository.findByName(badgeName);
        if (badgeOpt.isPresent()) {
            Badge badge = badgeOpt.get();
            if (!userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId())) {
                UserBadge userBadge = new UserBadge();
                userBadge.setUserId(userId);
                userBadge.setBadge(badge);
                userBadge.setUnlockedAt(LocalDateTime.now());
                userBadgeRepository.save(userBadge);
                System.out.println("Unlocked Badge '" + badgeName + "' for User ID: " + userId);
            }
        }
    }

    public List<UserBadge> getUserBadges(Long userId) {
        return userBadgeRepository.findByUserId(userId);
    }

    public Optional<UserGamification> getUserGamification(Long userId) {
        return gamificationRepository.findByUserId(userId);
    }
}
