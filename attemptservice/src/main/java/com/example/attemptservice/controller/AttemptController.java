package com.example.attemptservice.controller;

import com.example.attemptservice.dto.AttemptRequest;
import com.example.attemptservice.dto.AttemptResponse;
import com.example.attemptservice.service.AttemptService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attempts")
public class AttemptController {

    private final AttemptService attemptService;

    public AttemptController(
            AttemptService attemptService) {

        this.attemptService = attemptService;
    }

    @PostMapping
    public AttemptResponse saveAttempt(
            @Valid @RequestBody AttemptRequest request) {

        return attemptService.saveAttempt(request);
    }

    @GetMapping("/{id}")
    public AttemptResponse getAttemptById(
            @PathVariable Long id) {

        return attemptService.getAttemptById(id);
    }

    @GetMapping("/user/{userId}")
    public List<AttemptResponse> getAttemptsByUserId(
            @PathVariable Long userId) {

        return attemptService.getAttemptsByUserId(userId);
    }

    @GetMapping
    public List<AttemptResponse> getAllAttempts() {

        return attemptService.getAllAttempts();
    }

    @DeleteMapping("/{id}")
    public String deleteAttempt(
            @PathVariable Long id) {

        attemptService.deleteAttempt(id);

        return "Attempt Deleted Successfully";
    }
}