package com.auth_service.auth_service.controller;

import com.auth_service.auth_service.entity.User;
import com.auth_service.auth_service.service.RegisterService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class RegisterController {

    @Autowired
    private RegisterService service;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody User user) {

        System.out.println("API HIT");

        try {

            String msg = service.registerUser(user);

            return ResponseEntity.ok(msg);

        } catch (IllegalStateException ex) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(ex.getMessage());
        }
    }
}