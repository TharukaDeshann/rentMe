package com.example.springrentMe.utils;

import com.example.springrentMe.models.AuthProvider;
import com.example.springrentMe.models.User;
import com.example.springrentMe.models.UserRole;
import com.example.springrentMe.security.UserDetailsImpl;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("JWT Token Provider Tests")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();

        // Set JWT properties using reflection
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret",
                "testSecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLongForHS256Algorithm");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", 86400000L);

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        testUser.setRole(UserRole.RENTER);
        testUser.setAuthProvider(AuthProvider.LOCAL);
    }

    @Test
    @DisplayName("Should generate valid JWT token from username")
    void testGenerateTokenFromUsername() {
        // Act
        String token = jwtTokenProvider.generateTokenFromUsername("test@example.com");

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts
    }

    @Test
    @DisplayName("Should generate valid JWT token from Authentication")
    void testGenerateToken() {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        UserDetailsImpl userDetails = UserDetailsImpl.build(testUser);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        // Act
        String token = jwtTokenProvider.generateToken(authentication);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    @DisplayName("Should extract username from valid token")
    void testGetUsernameFromToken() {
        // Arrange
        String token = jwtTokenProvider.generateTokenFromUsername("test@example.com");

        // Act
        String username = jwtTokenProvider.getUsernameFromToken(token);

        // Assert
        assertEquals("test@example.com", username);
    }

    @Test
    @DisplayName("Should validate correct token")
    void testValidateToken_ValidToken() {
        // Arrange
        String token = jwtTokenProvider.generateTokenFromUsername("test@example.com");

        // Act
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Assert
        assertTrue(isValid);
    }

    @Test
    @DisplayName("Should reject invalid token")
    void testValidateToken_InvalidToken() {
        // Arrange
        String invalidToken = "invalid.jwt.token";

        // Act
        boolean isValid = jwtTokenProvider.validateToken(invalidToken);

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should reject null token")
    void testValidateToken_NullToken() {
        // Act
        boolean isValid = jwtTokenProvider.validateToken(null);

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should reject empty token")
    void testValidateToken_EmptyToken() {
        // Act
        boolean isValid = jwtTokenProvider.validateToken("");

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should generate different tokens for different users")
    void testGenerateToken_DifferentUsers() {
        // Arrange
        String token1 = jwtTokenProvider.generateTokenFromUsername("user1@example.com");
        String token2 = jwtTokenProvider.generateTokenFromUsername("user2@example.com");

        // Act
        String username1 = jwtTokenProvider.getUsernameFromToken(token1);
        String username2 = jwtTokenProvider.getUsernameFromToken(token2);

        // Assert
        assertNotEquals(token1, token2);
        assertEquals("user1@example.com", username1);
        assertEquals("user2@example.com", username2);
    }

    @Test
    @DisplayName("Should maintain token consistency for same user")
    void testGenerateToken_SameUser() {
        // Arrange
        String token1 = jwtTokenProvider.generateTokenFromUsername("test@example.com");

        // Simulate time passing (but within expiration)
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String token2 = jwtTokenProvider.generateTokenFromUsername("test@example.com");

        // Act
        String username1 = jwtTokenProvider.getUsernameFromToken(token1);
        String username2 = jwtTokenProvider.getUsernameFromToken(token2);

        // Assert
        assertEquals(username1, username2);
        assertEquals("test@example.com", username1);
    }
}
