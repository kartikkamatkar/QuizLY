package com.auth_service.auth_service.controller;

import com.auth_service.auth_service.dto.AuthResponse;
import com.auth_service.auth_service.dto.OTPVerifyRequest;
import com.auth_service.auth_service.dto.ResetPasswordRequest;
import com.auth_service.auth_service.entity.User;
import com.auth_service.auth_service.jwt.JwtUtil;
import com.auth_service.auth_service.repository.UserRepository;
import com.auth_service.auth_service.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final BCryptPasswordEncoder encoder;
    private final RedisService redisService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final EmailService emailService;
    private final AuthService authService;

    public AuthController(BCryptPasswordEncoder encoder,
                          RedisService redisService,
                          UserRepository userRepository,
                          JwtUtil jwtUtil,
                          OtpService otpService,
                          EmailService emailService,
                          AuthService authService) {
        this.encoder = encoder;
        this.redisService = redisService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.otpService = otpService;
        this.emailService = emailService;
        this.authService = authService;
    }

    @GetMapping("/stats")
    public String stats() {
        return "Admin Access Granted";
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody User user) {
        try {
            String msg = authService.registerUser(user);
            return ResponseEntity.ok(msg);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            AuthResponse response = authService.loginUser(user);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        }
    }

    @PostMapping("/verifyotp")
    public ResponseEntity<?> verifyotp(@RequestBody OTPVerifyRequest request) {
        try {
            AuthResponse response = authService.verifyOtp(request);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String token = body.get("refreshToken");
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Refresh Token is required");
        }
        try {
            AuthResponse response = authService.refreshAccessToken(token);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            redisService.blacklistToken(token);
        }
        return ResponseEntity.ok("LogOut Successful");
    }

    @PostMapping("/forgetpass")
    public ResponseEntity<String> forgetpass(@RequestBody User user) {
        User dbuser = userRepository.findByEmail(user.getEmail()).orElse(null);
        if (dbuser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email does not exist");
        }
        String otp = otpService.otpService();
        redisService.saveOtp(user.getEmail(), otp);
        emailService.sendOtp(user.getEmail(), otp);
        return ResponseEntity.ok("Reset OTP sent successfully");
    }

    @PostMapping("/resetpass")
    public ResponseEntity<String> resetpass(@RequestBody ResetPasswordRequest request) {
        String saveOTP = redisService.getOTP(request.getEmail());
        if (saveOTP == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("OTP Expired");
        }
        if (!saveOTP.equals(request.getOtp())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid OTP");
        }
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("Password Reset Successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token Missing");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User Not Found");
        }
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token Missing");
        }
        String token = authHeader.substring(7);
        try {
            String email = jwtUtil.extractUsername(token);
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User Not Found");
            }
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "email", user.getEmail(),
                    "role", user.getRole()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false));
        }
    }
}