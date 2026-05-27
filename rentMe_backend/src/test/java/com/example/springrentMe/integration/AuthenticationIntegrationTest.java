package com.example.springrentMe.integration;

import com.example.springrentMe.DTOs.LoginRequest;
import com.example.springrentMe.DTOs.RegisterRequest;
import com.example.springrentMe.models.UserRole;
import com.example.springrentMe.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(locations = "classpath:application-test.properties")
@DisplayName("Authentication Integration Tests")
class AuthenticationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        // Clean database before each test
        userRepository.deleteAll();

        registerRequest = new RegisterRequest();
        registerRequest.setFullName("Integration Test User");
        registerRequest.setEmail("integration@example.com");
        registerRequest.setPassword("securePassword123");
        registerRequest.setContactNumber("+1234567890");
        registerRequest.setRole(UserRole.RENTER);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("integration@example.com");
        loginRequest.setPassword("securePassword123");
    }

    @Test
    @DisplayName("Should complete full registration and login flow")
    void testFullAuthenticationFlow() throws Exception {
        // Step 1: Register new user
        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.email").value("integration@example.com"))
                .andExpect(cookie().exists("jwt_token"))
                .andReturn();

        // Step 2: Logout
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("jwt_token", 0));

        // Step 3: Login with registered credentials
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.email").value("integration@example.com"))
                .andExpect(cookie().exists("jwt_token"));
    }

    @Test
    @DisplayName("Should prevent duplicate registration")
    void testDuplicateRegistration() throws Exception {
        // First registration
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // Attempt duplicate registration
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should reject login with wrong password")
    void testLoginWithWrongPassword() throws Exception {
        // Register user
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // Attempt login with wrong password
        loginRequest.setPassword("wrongPassword");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should reject login for non-existent user")
    void testLoginNonExistentUser() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should persist user data correctly")
    void testUserDataPersistence() throws Exception {
        // Register user
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // Verify user exists in database
        assertTrue(userRepository.existsByEmail("integration@example.com"));

        var user = userRepository.findByEmail("integration@example.com");
        assertTrue(user.isPresent());
        assertEquals("Integration Test User", user.get().getFullName());
        assertEquals("RENTER", user.get().getRole().toString());
    }

    @Test
    @DisplayName("Should set HTTP-only secure cookies")
    void testCookieSecurityAttributes() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("jwt_token"))
                .andExpect(cookie().httpOnly("jwt_token", true))
                .andExpect(cookie().path("jwt_token", "/"));
    }
}
