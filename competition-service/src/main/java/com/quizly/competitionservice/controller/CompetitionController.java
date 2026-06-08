package com.quizly.competitionservice.controller;

import com.quizly.competitionservice.entity.Competition;
import com.quizly.competitionservice.entity.Participant;
import com.quizly.competitionservice.repository.CompetitionRepository;
import com.quizly.competitionservice.repository.ParticipantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/competitions")
public class CompetitionController {

    private final CompetitionRepository competitionRepository;
    private final ParticipantRepository participantRepository;

    public CompetitionController(CompetitionRepository competitionRepository, ParticipantRepository participantRepository) {
        this.competitionRepository = competitionRepository;
        this.participantRepository = participantRepository;
    }

    // Generate random 6-character room code
    private String generateRoomCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random rnd = new Random();
        while (sb.length() < 6) {
            int index = (int) (rnd.nextFloat() * chars.length());
            sb.append(chars.charAt(index));
        }
        return sb.toString();
    }

    // 1. Create a competition lobby
    @PostMapping
    public ResponseEntity<?> createCompetition(@RequestBody Map<String, Object> request) {
        try {
            String title = (String) request.get("title");
            String category = (String) request.get("category");
            Integer questionCount = (Integer) request.get("questionCount");
            Integer timeLimit = (Integer) request.get("timeLimit");
            Long hostUserId = ((Number) request.get("hostUserId")).longValue();
            String hostUserName = (String) request.get("hostUserName");

            if (title == null || category == null || hostUserId == null) {
                return ResponseEntity.badRequest().body("Missing required lobby details");
            }

            String code;
            // Ensure unique code
            do {
                code = generateRoomCode();
            } while (competitionRepository.findByRoomCode(code).isPresent());

            Competition comp = new Competition();
            comp.setRoomCode(code);
            comp.setTitle(title);
            comp.setCategory(category);
            comp.setQuestionCount(questionCount != null ? questionCount : 10);
            comp.setTimeLimit(timeLimit != null ? timeLimit : 15);
            comp.setHostUserId(hostUserId);
            comp.setStatus("LOBBY");

            Competition savedComp = competitionRepository.save(comp);

            // Host automatically joins the lobby
            Participant host = new Participant();
            host.setRoomCode(code);
            host.setUserId(hostUserId);
            host.setUserName(hostUserName != null ? hostUserName : "Host");
            host.setScore(0);
            host.setSubmitted(false);
            participantRepository.save(host);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedComp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating competition: " + e.getMessage());
        }
    }

    // 2. Fetch lobby/room details and participant list
    @GetMapping("/{roomCode}")
    public ResponseEntity<?> getCompetitionDetails(@PathVariable String roomCode) {
        String code = roomCode.toUpperCase();
        Optional<Competition> compOpt = competitionRepository.findByRoomCode(code);
        if (compOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Competition room not found");
        }

        Competition comp = compOpt.get();
        List<Participant> participants = participantRepository.findByRoomCode(code);

        Map<String, Object> response = new HashMap<>();
        response.put("competition", comp);
        response.put("participants", participants);

        return ResponseEntity.ok(response);
    }

    // 3. Join a lobby
    @PostMapping("/{roomCode}/join")
    public ResponseEntity<?> joinCompetition(
            @PathVariable String roomCode, 
            @RequestBody Map<String, Object> request) {
        
        String code = roomCode.toUpperCase();
        Optional<Competition> compOpt = competitionRepository.findByRoomCode(code);
        if (compOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Competition room not found");
        }

        Competition comp = compOpt.get();
        if (!"LOBBY".equals(comp.getStatus())) {
            return ResponseEntity.badRequest().body("Competition has already started or completed");
        }

        try {
            Long userId = ((Number) request.get("userId")).longValue();
            String userName = (String) request.get("userName");

            if (userId == null || userName == null) {
                return ResponseEntity.badRequest().body("User ID and Name are required");
            }

            Optional<Participant> partOpt = participantRepository.findByRoomCodeAndUserId(code, userId);
            if (partOpt.isPresent()) {
                // Already in room, return success
                return ResponseEntity.ok(participantRepository.findByRoomCode(code));
            }

            Participant p = new Participant();
            p.setRoomCode(code);
            p.setUserId(userId);
            p.setUserName(userName);
            p.setScore(0);
            p.setSubmitted(false);
            participantRepository.save(p);

            return ResponseEntity.ok(participantRepository.findByRoomCode(code));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error joining room: " + e.getMessage());
        }
    }

    // 4. Start competition
    @PostMapping("/{roomCode}/start")
    public ResponseEntity<?> startCompetition(
            @PathVariable String roomCode, 
            @RequestParam Long userId) {
        
        String code = roomCode.toUpperCase();
        Optional<Competition> compOpt = competitionRepository.findByRoomCode(code);
        if (compOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Competition room not found");
        }

        Competition comp = compOpt.get();
        if (!comp.getHostUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only the host can start the competition");
        }

        if (!"LOBBY".equals(comp.getStatus())) {
            return ResponseEntity.badRequest().body("Competition cannot be started in state: " + comp.getStatus());
        }

        comp.setStatus("ACTIVE");
        Competition updatedComp = competitionRepository.save(comp);

        return ResponseEntity.ok(updatedComp);
    }

    // 5. Submit user score points
    @PostMapping("/{roomCode}/submit")
    public ResponseEntity<?> submitScore(
            @PathVariable String roomCode, 
            @RequestBody Map<String, Object> request) {
        
        String code = roomCode.toUpperCase();
        Optional<Competition> compOpt = competitionRepository.findByRoomCode(code);
        if (compOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Competition room not found");
        }

        Competition comp = compOpt.get();
        try {
            Long userId = ((Number) request.get("userId")).longValue();
            Integer score = (Integer) request.get("score");

            if (userId == null || score == null) {
                return ResponseEntity.badRequest().body("User ID and Score are required");
            }

            Optional<Participant> partOpt = participantRepository.findByRoomCodeAndUserId(code, userId);
            if (partOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Participant not registered in this room");
            }

            Participant p = partOpt.get();
            p.setScore(score);
            p.setSubmitted(true);
            participantRepository.save(p);

            // Check if all participants have submitted
            List<Participant> participants = participantRepository.findByRoomCode(code);
            boolean allSubmitted = participants.stream().allMatch(Participant::getSubmitted);
            if (allSubmitted && "ACTIVE".equals(comp.getStatus())) {
                comp.setStatus("COMPLETED");
                competitionRepository.save(comp);
            }

            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error submitting score: " + e.getMessage());
        }
    }
}
