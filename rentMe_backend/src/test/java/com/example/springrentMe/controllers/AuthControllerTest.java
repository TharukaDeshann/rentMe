package com.example.springrentMe.controllers;

import com.example.springrentMe.DTOs.AuthResponse;
import com.example.springrentMe.DTOs.GoogleLoginRequest;
import com.example.springrentMe.DTOs.LoginRequest;
import com.example.springrentMe.DTOs.RegisterRequest;
import com.example.springrentMe.models.AuthProvider;
import com.example.springrentMe.models.User;
import com.example.springrentMe.models.UserRole;
import com.example.springrentMe.repositories.UserRepository;
import com.example.springrentMe.services.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@DisplayName("AuthController Integration Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private UserRepository userRepository;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private GoogleLoginRequest googleLoginRequest;
    private AuthResponse authResponse;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFullName("Test User");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setContactNumber("+1234567890");
        registerRequest.setRole(UserRole.RENTER);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        googleLoginRequest = new GoogleLoginRequest();
        googleLoginRequest.setToken("mock-google-token");

        authResponse = new AuthResponse("jwt-token", 1L, "test@example.com", "RENTER");

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        testUser.setRole(UserRole.RENTER);
        testUser.setAuthProvider(AuthProvider.LOCAL);
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Should register user successfully")
    void testRegister_Success() throws Exception {
        // Arrange
        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Registration successful"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("RENTER"))
                .andExpect(cookie().exists("jwt_token"))
                .andExpect(cookie().httpOnly("jwt_token", true));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Should return 400 for duplicate email")
    void testRegister_DuplicateEmail() throws Exception {
        // Arrange
        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new RuntimeException("Email already registered"));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Should login successfully")
    void testLogin_Success() throws Exception {
        // Arrange
        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(cookie().exists("jwt_token"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Should return 401 for invalid credentials")
    void testLogin_InvalidCredentials() throws Exception {
        // Arrange
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/auth/google - Should authenticate with Google successfully")
    void testGoogleLogin_Success() throws Exception {
        // Arrange
        User googleUser = new User();
        googleUser.setUserId(2L);
        googleUser.setEmail("google@example.com");
        googleUser.setFullName("Google User");
        googleUser.setRole(UserRole.RENTER);
        googleUser.setAuthProvider(AuthProvider.GOOGLE);

        AuthResponse googleAuthResponse = new AuthResponse(
                "jwt-token", 2L, "google@example.com", "RENTER");

        when(authService.googleLogin("mock-google-token")).thenReturn(googleAuthResponse);
        when(userRepository.findByEmail("google@example.com")).thenReturn(Optional.of(googleUser));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/google")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(googleLoginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Google login successful"))
                .andExpect(jsonPath("$.userId").value(2))
                .andExpect(jsonPath("$.email").value("google@example.com"))
                .andExpect(cookie().exists("jwt_token"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/google - Should return 401 for invalid token")
    void testGoogleLogin_InvalidToken() throws Exception {
        // Arrange
        when(authService.googleLogin("mock-google-token"))
                .thenThrow(new RuntimeException("Invalid Google token"));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/google")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(googleLoginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/auth/logout - Should clear cookies")
    void testLogout_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Logout successful"))
                .andExpect(cookie().maxAge("jwt_token", 0));
    }

    @Test
    @DisplayName("GET /api/v1/auth/test - Should return success message")
    void testAuthEndpoint() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/auth/test"))
                .andExpect(status().isOk())
                .andExpect(content().string("Auth endpoints are working!"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Should validate required fields")
    void testRegister_MissingFields() throws Exception {
        // Arrange
        RegisterRequest invalidRequest = new RegisterRequest();
        invalidRequest.setEmail("test@example.com");
        // Missing other required fields

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Should not return token in response body")
    void testLogin_TokenInCookieOnly() throws Exception {
        // Arrange
        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").doesNotExist()) // Token should not be in body
                .andExpect(cookie().exists("jwt_token")); // But should be in cookie
    }
}
