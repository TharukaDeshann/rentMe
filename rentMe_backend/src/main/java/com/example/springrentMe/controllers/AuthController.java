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
import jakarta.validation.Valid;
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
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
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
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
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
            responseBody.put("isNewUser", authResponse.isNewUser());

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
     * Complete OAuth2 registration - assign role to new Google user
     * POST /api/v1/auth/oauth2/complete-registration
     * Must be called when a new Google Sign-In user selects their role.
     */
    @PostMapping("/oauth2/complete-registration")
    public ResponseEntity<?> completeOAuth2Registration(
            @Valid @RequestBody com.example.springrentMe.DTOs.CompleteOAuth2RegistrationRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            HttpServletResponse response) {
        try {
            // Get the authenticated user's ID from the user_info cookie
            String userInfoCookie = null;
            if (httpRequest.getCookies() != null) {
                for (jakarta.servlet.http.Cookie cookie : httpRequest.getCookies()) {
                    if ("user_info".equals(cookie.getName())) {
                        userInfoCookie = cookie.getValue();
                        break;
                    }
                }
            }

            if (userInfoCookie == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            // Decode the URL-encoded cookie value and extract userId
            String decoded = java.net.URLDecoder.decode(userInfoCookie, java.nio.charset.StandardCharsets.UTF_8);
            // Parse userId from JSON: {"userId":123,"email":"...","role":"...","authProvider":"..."}
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(decoded);
            Long userId = node.get("userId").asLong();

            // Complete the registration by assigning the selected role
            authService.completeOAuth2Registration(userId, request.getRole());

            // Fetch updated user to refresh cookies with new role
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Refresh auth cookies with updated role info
            String freshToken = authService.generateTokenForUser(user.getEmail());
            CookieUtils.setAuthCookies(response, freshToken, user);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("message", "Registration completed");
            responseBody.put("role", user.getRole().name());
            responseBody.put("userId", user.getUserId());

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to complete registration: " + e.getMessage());
        }
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
