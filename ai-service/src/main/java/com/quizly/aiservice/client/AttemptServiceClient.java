package com.quizly.aiservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "attempt-service", fallback = AttemptServiceClientFallback.class)
public interface AttemptServiceClient {

    @GetMapping("/api/attempts/dashboard/user/{userId}")
    List<Map<String, Object>> getAttemptsByUserId(@PathVariable("userId") Long userId);
}
