package com.quizly.aiservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.Map;

@FeignClient(name = "attempt-service", fallback = AttemptServiceClientFallback.class)
public interface AttemptServiceClient {

    @GetMapping("/api/attempts/dashboard/user/{userId}")
    List<Map<String, Object>> getAttemptsByUserId(
            @PathVariable("userId") Long userId,
            @RequestHeader("X-User-Id") String xUserId,
            @RequestHeader("X-User-Role") String xUserRole
    );
}
