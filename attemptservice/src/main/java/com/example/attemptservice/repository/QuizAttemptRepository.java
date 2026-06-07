package com.example.attemptservice.repository;

import com.example.attemptservice.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt,Long>
{
    List<QuizAttempt> findByUserId(Long userId);
    @Query("""
    SELECT qa.userId, SUM(qa.score)
    FROM QuizAttempt qa
    GROUP BY qa.userId
    ORDER BY SUM(qa.score) DESC
    """)
    List<Object[]> getLeaderboard();
}
