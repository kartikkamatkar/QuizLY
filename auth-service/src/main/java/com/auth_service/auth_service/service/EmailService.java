package com.auth_service.auth_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService
{
    @Autowired
    private JavaMailSender mailSender;
    public  void sendOtp(String to,String otp){
        SimpleMailMessage message =new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("OTP verification");
        message.setText("Your OTP is : "+otp);
        mailSender.send(message);
        System.out.println("Email Sent ");
    }
}
