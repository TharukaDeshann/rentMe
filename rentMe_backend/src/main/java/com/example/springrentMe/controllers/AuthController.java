package com.example.springrentMe.controllers;

import com.example.springrentMe.DTOs.AuthResponse;
import com.example.springrentMe.DTOs.GoogleLoginRequest;
import com.example.springrentMe.DTOs.LoginRequest;
import com.example.springrentMe.DTOs.RegisterRequest;
import com.example.springrentMe.models.User;
import com.example.springrentMe.repositories.UserRepository;
import com.example.springrentMe.services.AuthService;
import com.example.springrentMe.utils.CookieUtils;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
// CORS is now handled globally in CorsConfig.java
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    /**
     * Register a new user
     * POST /api/v1/auth/register
     * Sets JWT token in HTTP-only cookie for security
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.register(request);

            // Fetch user entity for cookie creation
            User user = userRepository.findByEmail(authResponse.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found after registration"));

            // Set JWT token in HTTP-only cookie using centralized utility
            CookieUtils.setAuthCookies(response, authResponse.getToken(), user);

            // Return user info (without token in body)
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Registration successful");
            responseBody.put("userId", authResponse.getUserId());
            responseBody.put("email", authResponse.getEmail());
            responseBody.put("role", authResponse.getRole());

            return ResponseEntity.ok(responseBody);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Login with email and password
     * POST /api/v1/auth/login
     * Sets JWT token in HTTP-only cookie for security
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.login(request);

            // Fetch user entity for cookie creation
            User user = userRepository.findByEmail(authResponse.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found after login"));

            // Set JWT token in HTTP-only cookie using centralized utility
            CookieUtils.setAuthCookies(response, authResponse.getToken(), user);

            // Return user info (without token in body)
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Login successful");
            responseBody.put("userId", authResponse.getUserId());
            responseBody.put("email", authResponse.getEmail());
            responseBody.put("role", authResponse.getRole());

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }

    /**
     * Google OAuth login
     * POST /api/v1/auth/google
     * Sets JWT token in HTTP-only cookie for security
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.googleLogin(request.getToken());

            // Fetch user entity for cookie creation
            User user = userRepository.findByEmail(authResponse.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found after Google login"));

            // Set JWT token in HTTP-only cookie using centralized utility
            CookieUtils.setAuthCookies(response, authResponse.getToken(), user);

            // Return user info (without token in body)
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Google login successful");
            responseBody.put("userId", authResponse.getUserId());
            responseBody.put("email", authResponse.getEmail());
            responseBody.put("role", authResponse.getRole());

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Google authentication failed: " + e.getMessage());
        }
    }

    /**
     * Test endpoint to verify authentication is working
     * GET /api/v1/auth/test
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Auth endpoints are working!");
    }

    /**
     * Logout endpoint - clears authentication cookies
     * POST /api/v1/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Clear authentication cookies using centralized utility
        CookieUtils.clearAuthCookies(response);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("message", "Logout successful");

        return ResponseEntity.ok(responseBody);
    }
}
