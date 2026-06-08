package com.quizly.competitionservice.repository;

import com.quizly.competitionservice.entity.Competition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CompetitionRepository extends JpaRepository<Competition, Long> {
    Optional<Competition> findByRoomCode(String roomCode);
}
