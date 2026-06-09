package com.auth_service.auth_service.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil
{
    /*
     HUMAN NOTE:
     CHANGE: JWT secret was moved out of source code and is now injected
     from `application.properties` using `@Value("${jwt.secret}")`.
     WHY: keeping secrets in code is insecure and inflexible. Using a
     property lets you set different secrets per environment and keep
     secrets out of version control.
     HOW TO EDIT: set `jwt.secret` in `src/main/resources/application.properties`
     or provide an environment variable when running (e.g. export JWT_SECRET=...)
     */

    @Value("${jwt.secret:mydevsecretmydevsecretmydevsecret1234567890}")
    private String secretKey;

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateToken(String username, String role, Long userId)
    {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .claim("userId", userId != null ? userId.toString() : "")
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + 1000 * 60 * 60)
                )
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token)
    {
        return extractClaims(token).getSubject();
    }

    public Claims extractClaims(String token)
    {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(
            String token,
            UserDetails userDetails
    )
    {
        String username = extractUsername(token);

        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }//

    private boolean isTokenExpired(String token)
    {
        return extractClaims(token)
                .getExpiration()
                .before(new Date());
    }
}