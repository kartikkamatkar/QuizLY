package com.auth_service.auth_service.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.auth_service.auth_service.entity.User;
import com.auth_service.auth_service.jwt.JwtUtil;
import com.auth_service.auth_service.repository.RegisterRepo;

import java.util.Optional;

@Service
public class LoginService
{
    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RegisterRepo repo;

    @Autowired
    private RedisService redisService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    public String loginuser(User user)
    {
        Optional<User> dbuser =
                repo.findByEmail(user.getEmail());

        if(user.getPassword()==null){
            return "password required";
        }
        if(dbuser.isEmpty())
        {
            return "User not found";
        }

        boolean isMatch = encoder.matches(
                user.getPassword(),
                dbuser.get().getPassword()
        );

        if(isMatch)
        {
            // Successful password match: return JWT token for the client
            return jwtUtil.generateToken(dbuser.get().getEmail());
        }

        return  "Invalid Credentials";
    }
}