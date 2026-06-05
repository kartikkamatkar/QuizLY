package com.quizly.quizservice.repository;

import com.quizly.quizservice.entity.Question;
import com.quizly.quizservice.enums.Category;
import com.quizly.quizservice.enums.Difficulty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByCategory(Category category);

    List<Question> findByDifficulty(Difficulty difficulty);
    List<Question> findByQuizId(Long quizId);

}