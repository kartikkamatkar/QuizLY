package com.quizly.quizservice.client;

import com.quizly.quizservice.dto.AttemptRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "attempt-service", fallback = AttemptClientFallback.class)
public interface AttemptClient {

    @PostMapping("/api/attempts")
    Object saveAttempt(
            @RequestBody AttemptRequest attemptRequest,
            @RequestHeader("X-User-Id") String xUserId
    );
}
