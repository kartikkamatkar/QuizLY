package com.apigateway.api_gateway.security;

import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import reactor.core.publisher.Mono;

@Component
public class JwtGatewayFilter implements GlobalFilter {

    private final JwtUtil jwtUtil;

    public JwtGatewayFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(
            ServerWebExchange exchange,
            GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();

        if (path.startsWith("/auth") || path.startsWith("/ws")) {
            return chain.filter(exchange);
        }

        String authHeader =
                exchange.getRequest()
                        .getHeaders()
                        .getFirst("Authorization");

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            ServerHttpResponse response =
                    exchange.getResponse();

            response.setStatusCode(HttpStatus.UNAUTHORIZED);

            return response.setComplete();
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.validateToken(token)) {

            ServerHttpResponse response =
                    exchange.getResponse();

            response.setStatusCode(HttpStatus.UNAUTHORIZED);

            return response.setComplete();
        }

        try {
            io.jsonwebtoken.Claims claims = jwtUtil.getClaims(token);
            String email = claims.getSubject();
            String role = (String) claims.get("role");
            String userId = (String) claims.get("userId");

            ServerWebExchange mutatedExchange = exchange.mutate()
                    .request(builder -> builder
                            .header("X-User-Email", email != null ? email : "")
                            .header("X-User-Role", role != null ? role : "")
                            .header("X-User-Id", userId != null ? userId : ""))
                    .build();

            return chain.filter(mutatedExchange);
        } catch (Exception e) {
            ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return response.setComplete();
        }
    }
}