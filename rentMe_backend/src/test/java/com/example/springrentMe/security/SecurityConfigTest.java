package com.example.springrentMe.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@DisplayName("Security Configuration Tests")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should allow access to public auth endpoints without authentication")
    void testPublicEndpoints_NoAuth() throws Exception {
        // Auth endpoints should be accessible
        mockMvc.perform(get("/api/v1/auth/test"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should block access to protected endpoints without JWT token")
    void testProtectedEndpoints_NoAuth() throws Exception {
        // User endpoints should require authentication
        mockMvc.perform(get("/api/v1/users/1"))
                .andExpect(status().isForbidden()); // Spring Security returns 403 for anonymous users
    }

    @Test
    @DisplayName("Should allow CORS from configured origins")
    void testCORS_AllowedOrigin() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                .header("Origin", "http://localhost:3000")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@test.com\",\"password\":\"pass\"}"))
                .andExpect(status().isUnauthorized()); // Fails auth but CORS passes
    }

    @Test
    @DisplayName("Should have CSRF disabled for REST API")
    void testCSRF_Disabled() throws Exception {
        // POST requests should work without CSRF token (REST API mode)
        mockMvc.perform(post("/api/v1/auth/test")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isMethodNotAllowed()); // Method not allowed, not CSRF error
    }

    @Test
    @DisplayName("Should enforce role-based access control")
    void testRoleBasedAccess() throws Exception {
        // Admin endpoints should require ADMIN role
        mockMvc.perform(get("/api/v1/admin/users"))
                .andExpect(status().isForbidden()); // Spring Security returns 403 for anonymous users
    }

    @Test
    @DisplayName("Should allow OPTIONS requests for CORS preflight")
    void testCORS_Preflight() throws Exception {
        mockMvc.perform(options("/api/v1/auth/login")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk());
    }
}
