package com.example.attemptservice.controller;

import com.example.attemptservice.dto.AttemptRequest;
import com.example.attemptservice.dto.AttemptResponse;
import com.example.attemptservice.dto.LeaderboardResponse;
import com.example.attemptservice.service.AttemptService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attempts")
public class AttemptController {

    private final AttemptService attemptService;

    public AttemptController(AttemptService attemptService) {
        this.attemptService = attemptService;
    }

    @PostMapping
    public AttemptResponse saveAttempt(
            @Valid @RequestBody AttemptRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {

        if (xUserId != null && !xUserId.isEmpty()) {
            Long headerUserId = Long.valueOf(xUserId);
            if (!headerUserId.equals(request.getUserId())) {
                throw new SecurityException("Unauthorized: User ID mismatch (BOLA)");
            }
        } else {
            throw new SecurityException("Unauthorized: Missing user identification header");
        }

        return attemptService.saveAttempt(request);
    }

    @GetMapping("/{id}")
    public AttemptResponse getAttemptById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {

        AttemptResponse response = attemptService.getAttemptById(id);

        if (xUserId != null && !xUserId.isEmpty()) {
            Long headerUserId = Long.valueOf(xUserId);
            boolean isAdmin = "ADMIN".equalsIgnoreCase(xUserRole);
            if (!headerUserId.equals(response.getUserId()) && !isAdmin) {
                throw new SecurityException("Unauthorized: Access denied to this attempt (BOLA)");
            }
        } else {
            throw new SecurityException("Unauthorized: Missing user identification header");
        }

        return response;
    }

    @GetMapping("/dashboard/user/{userId}")
    public List<AttemptResponse> getAttemptsByUserId(
            @PathVariable Long userId,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {

        if (xUserId != null && !xUserId.isEmpty()) {
            Long headerUserId = Long.valueOf(xUserId);
            boolean isAdmin = "ADMIN".equalsIgnoreCase(xUserRole);
            if (!headerUserId.equals(userId) && !isAdmin) {
                throw new SecurityException("Unauthorized: Access denied to other user's dashboard (BOLA)");
            }
        } else {
            throw new SecurityException("Unauthorized: Missing user identification header");
        }

        return attemptService.getAttemptsByUserId(userId);
    }

    @GetMapping
    public List<AttemptResponse> getAllAttempts(
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {
        
        // Only Admin can list all attempts in the system
        if (xUserRole == null || !"ADMIN".equalsIgnoreCase(xUserRole)) {
            throw new SecurityException("Unauthorized: Admin privilege required");
        }

        return attemptService.getAllAttempts();
    }

    @DeleteMapping("/{id}")
    public String deleteAttempt(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {

        AttemptResponse response = attemptService.getAttemptById(id);

        if (xUserId != null && !xUserId.isEmpty()) {
            Long headerUserId = Long.valueOf(xUserId);
            boolean isAdmin = "ADMIN".equalsIgnoreCase(xUserRole);
            if (!headerUserId.equals(response.getUserId()) && !isAdmin) {
                throw new SecurityException("Unauthorized: Access denied to delete this attempt (BOLA)");
            }
        } else {
            throw new SecurityException("Unauthorized: Missing user identification header");
        }

        attemptService.deleteAttempt(id);
        return "Attempt Deleted Successfully";
    }

    @GetMapping("/leaderboard")
    public List<LeaderboardResponse> getLeaderboard() {
        return attemptService.getLeaderboard();
    }
}