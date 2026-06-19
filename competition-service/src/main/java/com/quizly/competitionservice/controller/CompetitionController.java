package com.quizly.competitionservice.controller;

import com.quizly.competitionservice.dto.CreateCompetitionRequest;
import com.quizly.competitionservice.dto.JoinCompetitionRequest;
import com.quizly.competitionservice.dto.SubmitScoreRequest;
import com.quizly.competitionservice.entity.Competition;
import com.quizly.competitionservice.entity.Participant;
import com.quizly.competitionservice.repository.CompetitionRepository;
import com.quizly.competitionservice.repository.ParticipantRepository;
import jakarta.validation.Valid;
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
    public ResponseEntity<?> createCompetition(
            @Valid @RequestBody CreateCompetitionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {
        
        if (xUserId != null && !xUserId.isEmpty()) {
            Long headerUserId = Long.valueOf(xUserId);
            if (!headerUserId.equals(request.getHostUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized: Host User ID mismatch (BOLA)");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Missing user identification header");
        }

        try {
            String title = request.getTitle();
            String category = request.getCategory();
            Integer questionCount = request.getQuestionCount();
            Integer timeLimit = request.getTimeLimit();
            Long hostUserId = request.getHostUserId();
            String hostUserName = request.getHostUserName();

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
            @Valid @RequestBody JoinCompetitionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {
        
        if (xUserId != null && !xUserId.isEmpty()) {
            Long headerUserId = Long.valueOf(xUserId);
            if (!headerUserId.equals(request.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized: User ID mismatch (BOLA)");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Missing user identification header");
        }

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
            Long userId = request.getUserId();
            String userName = request.getUserName();

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
            @RequestParam Long userId,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {
        
        if (xUserId != null && !xUserId.isEmpty()) {
            Long headerUserId = Long.valueOf(xUserId);
            if (!headerUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized: User ID mismatch (BOLA)");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Missing user identification header");
        }

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
            @Valid @RequestBody SubmitScoreRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {
        
        if (xUserId != null && !xUserId.isEmpty()) {
            Long headerUserId = Long.valueOf(xUserId);
            if (!headerUserId.equals(request.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized: User ID mismatch (BOLA)");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Missing user identification header");
        }

        String code = roomCode.toUpperCase();
        Optional<Competition> compOpt = competitionRepository.findByRoomCode(code);
        if (compOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Competition room not found");
        }

        Competition comp = compOpt.get();
        try {
            Long userId = request.getUserId();
            Integer score = request.getScore();

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
