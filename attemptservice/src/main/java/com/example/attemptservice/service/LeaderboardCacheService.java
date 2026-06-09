package com.example.attemptservice.service;

import com.example.attemptservice.dto.LeaderboardResponse;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class LeaderboardCacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String LEADERBOARD_KEY = "quizly:leaderboard";

    public LeaderboardCacheService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void updateScore(Long userId, Long score) {
        // Increment user's total score in the leaderboard Redis Sorted Set
        redisTemplate.opsForZSet().incrementScore(LEADERBOARD_KEY, userId.toString(), score.doubleValue());
    }

    public List<LeaderboardResponse> getTopLeaderboard(int limit) {
        Set<ZSetOperations.TypedTuple<Object>> range = redisTemplate.opsForZSet()
                .reverseRangeWithScores(LEADERBOARD_KEY, 0, limit - 1);
        
        List<LeaderboardResponse> leaderboard = new ArrayList<>();
        if (range != null) {
            for (ZSetOperations.TypedTuple<Object> tuple : range) {
                if (tuple.getValue() != null && tuple.getScore() != null) {
                    LeaderboardResponse res = new LeaderboardResponse();
                    res.setUserId(Long.parseLong(tuple.getValue().toString()));
                    res.setTotalScore(tuple.getScore().longValue());
                    leaderboard.add(res);
                }
            }
        }
        return leaderboard;
    }

    public boolean hasLeaderboard() {
        Long size = redisTemplate.opsForZSet().size(LEADERBOARD_KEY);
        return size != null && size > 0;
    }

    public void clearLeaderboard() {
        redisTemplate.delete(LEADERBOARD_KEY);
    }
}
