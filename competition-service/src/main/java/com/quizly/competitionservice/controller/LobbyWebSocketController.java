package com.quizly.competitionservice.controller;

import com.quizly.competitionservice.entity.Competition;
import com.quizly.competitionservice.entity.Participant;
import com.quizly.competitionservice.repository.CompetitionRepository;
import com.quizly.competitionservice.repository.ParticipantRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
public class LobbyWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final CompetitionRepository competitionRepository;
    private final ParticipantRepository participantRepository;

    public LobbyWebSocketController(SimpMessagingTemplate messagingTemplate,
                                    CompetitionRepository competitionRepository,
                                    ParticipantRepository participantRepository) {
        this.messagingTemplate = messagingTemplate;
        this.competitionRepository = competitionRepository;
        this.participantRepository = participantRepository;
    }

    // Handle user joining a room via WebSockets
    @MessageMapping("/room/{roomCode}/join")
    public void joinRoom(@DestinationVariable String roomCode, @Payload Map<String, Object> payload) {
        String code = roomCode.toUpperCase();
        String userName = (String) payload.get("userName");
        Long userId = getLongValue(payload.get("userId"));

        Optional<Participant> partOpt = participantRepository.findByRoomCodeAndUserId(code, userId);
        if (partOpt.isEmpty()) {
            Participant p = new Participant();
            p.setRoomCode(code);
            p.setUserId(userId);
            p.setUserName(userName);
            p.setScore(0);
            p.setSubmitted(false);
            participantRepository.save(p);
        }

        // Broadcast refreshed participants list to all clients in the room
        List<Participant> participants = participantRepository.findByRoomCode(code);
        messagingTemplate.convertAndSend("/topic/room/" + code, Map.of(
            "type", "USER_JOINED",
            "userName", userName,
            "participants", participants
        ));
    }

    // Handle host starting the competition
    @MessageMapping("/room/{roomCode}/start")
    public void startRoom(@DestinationVariable String roomCode, @Payload Map<String, Object> payload) {
        String code = roomCode.toUpperCase();
        Long hostUserId = getLongValue(payload.get("hostUserId"));

        Optional<Competition> compOpt = competitionRepository.findByRoomCode(code);
        if (compOpt.isPresent()) {
            Competition comp = compOpt.get();
            if (comp.getHostUserId().equals(hostUserId)) {
                comp.setStatus("ACTIVE");
                competitionRepository.save(comp);

                messagingTemplate.convertAndSend("/topic/room/" + code, Map.of(
                    "type", "COMPETITION_STARTED",
                    "status", "ACTIVE"
                ));
            }
        }
    }

    // Handle real-time score updates during a live competition
    @MessageMapping("/room/{roomCode}/score")
    public void updateScore(@DestinationVariable String roomCode, @Payload Map<String, Object> payload) {
        String code = roomCode.toUpperCase();
        Long userId = getLongValue(payload.get("userId"));
        Integer score = getIntegerValue(payload.get("score"));

        Optional<Participant> partOpt = participantRepository.findByRoomCodeAndUserId(code, userId);
        if (partOpt.isPresent()) {
            Participant p = partOpt.get();
            p.setScore(score);
            p.setSubmitted(true);
            participantRepository.save(p);

            // Fetch live standings
            List<Participant> participants = participantRepository.findByRoomCode(code);
            
            // Auto complete if all are submitted
            Optional<Competition> compOpt = competitionRepository.findByRoomCode(code);
            if (compOpt.isPresent()) {
                Competition comp = compOpt.get();
                boolean allSubmitted = participants.stream().allMatch(Participant::getSubmitted);
                if (allSubmitted && "ACTIVE".equals(comp.getStatus())) {
                    comp.setStatus("COMPLETED");
                    competitionRepository.save(comp);
                }
            }

            // Broadcast real-time leaderboard update
            messagingTemplate.convertAndSend("/topic/room/" + code, Map.of(
                "type", "LEADERBOARD_UPDATE",
                "participants", participants
            ));
        }
    }

    private Long getLongValue(Object value) {
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        } else if (value instanceof String) {
            try {
                return Long.valueOf((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private Integer getIntegerValue(Object value) {
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).intValue();
        } else if (value instanceof String) {
            try {
                return Integer.valueOf((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
