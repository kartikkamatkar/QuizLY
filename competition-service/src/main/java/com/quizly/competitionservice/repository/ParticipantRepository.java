package com.quizly.competitionservice.repository;

import com.quizly.competitionservice.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    List<Participant> findByRoomCode(String roomCode);
    Optional<Participant> findByRoomCodeAndUserId(String roomCode, Long userId);
}
