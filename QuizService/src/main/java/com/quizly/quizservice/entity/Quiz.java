package com.quizly.quizservice.entity;

import com.quizly.quizservice.enums.Category;
import com.quizly.quizservice.enums.Difficulty;
import jakarta.persistence.*;

@Entity
@Table (name ="quizzes")
public class Quiz {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String title;

        private String description;

        @Enumerated(EnumType.STRING)
        private Category category;

        @Enumerated(EnumType.STRING)
        private Difficulty difficulty;

        private Integer timeLimit;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
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

        public Integer getTimeLimit() {
            return timeLimit;
        }

        public void setTimeLimit(Integer timeLimit) {
            this.timeLimit = timeLimit;
        }
}
