package com.capg.session.controller;

import com.capg.session.jwt.JWTUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller responsible for authentication token generation within the Session-Service module.
 *
 * This controller exposes a public endpoint for creating JWT tokens based on an email and role.
 * It does not call any Feign client directly; token generation is handled locally via JWTUtil.
 */
@RestController
@RequestMapping("/public/auth")
public class AuthController {

    /**
     * Generate a JWT token for a user based on provided email and role.
     *
     * This endpoint is public and performs token creation locally using JWTUtil.
     * It does not invoke any Feign clients.
     */
    @PostMapping("/token")
    public ResponseEntity<String> generateToken(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String role = request.get("role");

        if (email == null || role == null) {
            return ResponseEntity.badRequest().body("Email and role are required");
        }

        String token = JWTUtil.generateToken(email, role);
        return ResponseEntity.ok(token);
    }
}
