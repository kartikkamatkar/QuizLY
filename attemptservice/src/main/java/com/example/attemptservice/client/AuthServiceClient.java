package com.example.attemptservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {

    @PostMapping("/auth/gamification/attempt")
    Map<String, Object> processAttemptCompleted(@RequestBody Map<String, Object> body);
}
