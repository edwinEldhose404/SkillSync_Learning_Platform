package com.capg.authentication.controller;

import com.capg.authentication.dto.AuthResponse;
import com.capg.authentication.dto.LoginRequest;
import com.capg.authentication.dto.RegisterRequest;
import com.capg.authentication.service.AuthService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

/**
 * Authentication Controller for the Authentication-Service module.
 *
 * Exposes registration, login, refresh token, and simple test endpoints.
 * It delegates authentication workflows to AuthService.
 *
 * Feign: not used directly by this controller; remote user validation is performed in the service layer.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    // Constructor Injection
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a new user account.
     *
     * Accepts user registration details and returns authentication data.
     */
    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }
    
    /**
     * Authenticate a user with credentials.
     *
     * Returns an AuthResponse containing JWT tokens when successful.
     */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /**
     * Refresh an existing JWT token.
     *
     * Requires a valid Authorization header containing a bearer token.
     */
    @PostMapping("/refresh")
    public AuthResponse refresh(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        return authService.refresh(token);
    }
    
    /**
     * Simple admin-only test endpoint.
     *
     * Used to verify protected admin access.
     */
    @GetMapping("/admin/test")
    public String adminTest() {
        return "Admin access only";
    }

    /**
     * Simple user access test endpoint.
     *
     * Used to verify that authenticated user access works.
     */
    @GetMapping("/user/test")
    public String userTest() {
        return "User access";
    }
}