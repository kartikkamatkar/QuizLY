package com.auth_service.auth_service.controller;

import com.auth_service.auth_service.entity.RefreshToken;
import com.auth_service.auth_service.entity.User;
import com.auth_service.auth_service.service.LoginService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class LoginController {

    @Autowired
    private LoginService service;

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        return service.loginuser(user);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @RequestBody RefreshToken request) {

        return ResponseEntity
                .status(HttpStatus.NOT_IMPLEMENTED)
                .body("Refresh Token Pending");
    }
}