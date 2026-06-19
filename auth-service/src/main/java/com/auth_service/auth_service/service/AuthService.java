package com.auth_service.auth_service.service;

import com.auth_service.auth_service.dto.AuthResponse;
import com.auth_service.auth_service.dto.OTPVerifyRequest;
import com.auth_service.auth_service.entity.RefreshToken;
import com.auth_service.auth_service.entity.User;
import com.auth_service.auth_service.enums.Role;
import com.auth_service.auth_service.jwt.JwtUtil;
import com.auth_service.auth_service.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final BCryptPasswordEncoder encoder;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final OtpService otpService;
    private final RedisService redisService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    public AuthService(BCryptPasswordEncoder encoder,
                       UserRepository userRepository,
                       EmailService emailService,
                       OtpService otpService,
                       RedisService redisService,
                       JwtUtil jwtUtil,
                       RefreshTokenService refreshTokenService) {
        this.encoder = encoder;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.otpService = otpService;
        this.redisService = redisService;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
    }

    public String registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalStateException("Email already exists");
        }
        String otp = otpService.otpService();
        redisService.saveOtp(user.getEmail(), otp);
        emailService.sendOtp(user.getEmail(), otp);
        user.setPassword(encoder.encode(user.getPassword()));
        if (user.getEmail().toLowerCase().contains("admin")) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.USER);
        }
        redisService.saveUser(user.getEmail(), user);
        return "Registration Successful. OTP Sent Successfully.";
    }

    @Transactional
    public AuthResponse loginUser(User user) {
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
        User dbuser = userRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        boolean isMatch = encoder.matches(user.getPassword(), dbuser.getPassword());
        if (!isMatch) {
            throw new BadCredentialsException("Invalid Credentials");
        }

        String accessToken = jwtUtil.generateToken(dbuser.getEmail(), dbuser.getRole().name(), dbuser.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(dbuser.getEmail());

        return new AuthResponse(accessToken, refreshToken.getToken());
    }

    @Transactional
    public AuthResponse verifyOtp(OTPVerifyRequest request) {
        String saveOTP = redisService.getOTP(request.getEmail());
        if (saveOTP == null) {
            throw new IllegalArgumentException("OTP Expired");
        }
        if (!saveOTP.equals(request.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        User user = (User) redisService.getUser(request.getEmail());
        if (user == null) {
            throw new IllegalArgumentException("User Data Expired");
        }

        User savedUser = userRepository.save(user);
        redisService.deleteUser(request.getEmail());

        String accessToken = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getEmail());

        return new AuthResponse(accessToken, refreshToken.getToken());
    }

    @Transactional
    public AuthResponse refreshAccessToken(String refreshTokenStr) {
        return refreshTokenService.findByToken(refreshTokenStr)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String accessToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
                    return new AuthResponse(accessToken, refreshTokenStr);
                })
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired refresh token"));
    }
}
