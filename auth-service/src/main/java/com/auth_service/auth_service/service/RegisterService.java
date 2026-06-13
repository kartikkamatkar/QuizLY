package com.auth_service.auth_service.service;
import com.auth_service.auth_service.entity.User;
import com.auth_service.auth_service.enums.Role;
import com.auth_service.auth_service.repository.RegisterRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegisterService
{
    @Autowired
    private BCryptPasswordEncoder encoder;
    @Autowired
    private RegisterRepo repo;
    @Autowired
    private EmailService emailService;
    @Autowired
    private OtpService otpService;

    @Autowired
    private RedisService redisService;
    public String registerUser(User user){
        if(repo.existsByEmail(user.getEmail())){
            throw new IllegalStateException("Email already exists");
        }
        String otp = otpService.otpService();
        redisService.saveOtp(user.getEmail(),otp);
        emailService.sendOtp(user.getEmail(),otp);
        user.setPassword(encoder.encode(user.getPassword()));
        if (user.getEmail().toLowerCase().contains("admin")) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.USER);
        }
        redisService.saveUser(user.getEmail(),user);
        System.out.println("Saved ");
        return "Registration Successfully Otp Sent Successfully :";
    }

}
