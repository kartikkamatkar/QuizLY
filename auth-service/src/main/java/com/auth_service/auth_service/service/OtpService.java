package com.auth_service.auth_service.service;

import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class OtpService
{
    public String otpService(){
        Random random=new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

}
