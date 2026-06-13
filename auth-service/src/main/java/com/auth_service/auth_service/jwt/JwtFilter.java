package com.auth_service.auth_service.jwt;
import com.auth_service.auth_service.service.RedisService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
@Component
public class JwtFilter extends OncePerRequestFilter
{
    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private RedisService redisService;
    /*
     HUMAN NOTE:
     CHANGE: on invalid or expired JWT we now return HTTP 401 and a simple
     JSON error body instead of silently logging and allowing the request to
     continue.
     WHY: silently ignoring invalid tokens causes unclear behavior. An
     explicit 401 makes client behavior predictable.
     HOW TO EDIT: update the JSON message or logging as needed. This filter
     sends a minimal `{"error":"Invalid or expired token"}` response.
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException
    {
        // If the request is for a public endpoint, skip JWT checks entirely.
        // This prevents situations where a client accidentally sends an
        // invalid Authorization header and a public endpoint (like /register)
        // returns 401. Public endpoints are handled by Spring Security's
        // permitAll() configuration, so the filter should not block them.
        String path = request.getRequestURI();
        if (
                path.equals("/register") ||
                        path.equals("/auth/login") ||
                        path.equals("/auth/register") ||
                        path.equals("/auth/verifyotp") ||
                        path.equals("/auth/forgetpass") ||
                        path.equals("/auth/resetpass")
        ) {
            filterChain.doFilter(request, response);
            return;
        }
        String authHeader = request.getHeader("Authorization");

        String token = null;
        String username = null;
        if(authHeader != null && authHeader.startsWith("Bearer "))
        {
            token = authHeader.substring(7);

            if(redisService.isBlacklisted(token))
            {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

                response.setContentType("application/json");

                response.getWriter()
                        .write("{\"error\":\"Token Blacklisted\"}");

                return;
            }
            try
            {
                username = jwtUtil.extractUsername(token);
            }
            catch (Exception e)
            {
                logger.error("Invalid JWT Token: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
                return;
            }
        }

        if(username != null && SecurityContextHolder.getContext().getAuthentication() == null)
        {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if(jwtUtil.validateToken(token, userDetails))
            {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
            else
            {
                logger.warn("JWT validation failed for user: {}", username);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

}
