package com.example.attemptservice.repository;

import com.example.attemptservice.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt,Long>
{
    List<QuizAttempt> findByUserId(Long userId);
}
