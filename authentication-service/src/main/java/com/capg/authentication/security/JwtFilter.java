package com.capg.authentication.security;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

//Ask Spring to manage this as a Bean
@Component
public class JwtFilter extends OncePerRequestFilter {//OncePerRequestFilter to ensure one excecution per request


    @Override
    protected void doFilterInternal(HttpServletRequest request,//incoming request
                                    HttpServletResponse response,//eventual response to client
                                    FilterChain filterChain)//remaining filters in filter chain
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {//check if header has valid format

            String token = authHeader.substring(7);

            try {
                String email = JwtUtil.extractEmail(token);

                if (email != null && JwtUtil.validateToken(token)) {//validate token to prevent JWT tampering

                	String role = JwtUtil.extractRole(token);

                    // THIS IS THE IMPORTANT PART
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_"+role))//to work with hasROLE
                            );//singletonList because UPAT expects multiple values but we only using one; role

                    SecurityContextHolder.getContext().setAuthentication(authentication);//store auth details in SecContext

                    System.out.println("User authenticated: " + email);
                }

            } catch (Exception e) {
                System.out.println("Invalid token: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);//proceed to next filter step
    }
}