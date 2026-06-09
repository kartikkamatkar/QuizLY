package com.auth_service.auth_service.controller;
import com.auth_service.auth_service.dto.OTPVerifyRequest;
import com.auth_service.auth_service.dto.ResetPasswordRequest;
import com.auth_service.auth_service.entity.User;
import com.auth_service.auth_service.jwt.JwtUtil;
import com.auth_service.auth_service.repository.RegisterRepo;
import com.auth_service.auth_service.service.EmailService;
import com.auth_service.auth_service.service.OtpService;
import com.auth_service.auth_service.service.RedisService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    BCryptPasswordEncoder encoder;
    @Autowired
    private RedisService redisService;
    @Autowired
    private RegisterRepo repo;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private OtpService otpservice;
    @Autowired
    private EmailService emailService;

    @GetMapping("/stats")
    public String stats() {
        return "Admin Access Granted";
    }

    @PostMapping("/logout")
    public String logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = authHeader.substring(7);
        redisService.blacklistToken(token);
        return "LogOut ";
    }

    @PostMapping("/verifyotp")
    public String verifyotp(@RequestBody OTPVerifyRequest request) {

        String saveOTP = redisService.getOTP(request.getEmail());

        if (saveOTP == null) {
            return "OTP Expired";
        }

        if (!saveOTP.equals(request.getOtp())) {
            return "Invalid OTP";
        }

        User user = (User) redisService.getUser(request.getEmail());

        if (user == null) {
            return "User Data Expired";
        }

        User savedUser = repo.save(user);

        redisService.deleteUser(request.getEmail());

        return jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getId());
    }

    @PostMapping("/forgetpass")
    public String forgetpass(@RequestBody User user) {
        User dbuser = repo.findByEmail(user.getEmail()).orElse(null);
        if (dbuser == null) {
            return "Email not Exist ";
        }
        String otp = otpservice.otpService();
        redisService.saveOtp(user.getEmail(), otp);
        emailService.sendOtp(user.getEmail(), otp);
        return "Reset Otp sent ";


    }

    @PostMapping("/resetpass")
    private String resetpass(@RequestBody ResetPasswordRequest request) {
        String saveOTP = redisService.getOTP(request.getEmail());
        if (saveOTP == null) {
            return "OTP EXPIRED";
        }
        if (!saveOTP.equals(request.getOtp())) {
            return "Invalid OTP ";
        }
        User user = repo.findByEmail(request.getEmail()).get();
        user.setPassword(encoder.encode(request.getNewPassword()));
        repo.save(user);
        return "Password Reset Successfully";
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Token Missing");
        }

        String token = authHeader.substring(7);

        String email = jwtUtil.extractUsername(token);

        User user = repo.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User Not Found");
        }

        user.setPassword(null);

        return ResponseEntity.ok(user);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(HttpServletRequest request) {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Token Missing");
        }

        String token = authHeader.substring(7);

        try {

            String email = jwtUtil.extractUsername(token);

            User user = repo.findByEmail(email).orElse(null);

            if (user == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("User Not Found");
            }

            return ResponseEntity.ok(
                    Map.of(
                            "valid", true,
                            "email", user.getEmail(),
                            "role", user.getRole()
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("valid", false));
        }
    }
}