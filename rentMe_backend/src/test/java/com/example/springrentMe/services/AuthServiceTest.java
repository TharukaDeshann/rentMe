package com.example.springrentMe.services;

import com.example.springrentMe.DTOs.AuthResponse;
import com.example.springrentMe.DTOs.LoginRequest;
import com.example.springrentMe.DTOs.RegisterRequest;
import com.example.springrentMe.models.AuthProvider;
import com.example.springrentMe.models.Renter;
import com.example.springrentMe.models.User;
import com.example.springrentMe.models.UserRole;
import com.example.springrentMe.repositories.RenterRepository;
import com.example.springrentMe.repositories.UserRepository;
import com.example.springrentMe.security.UserDetailsImpl;
import com.example.springrentMe.utils.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RenterRepository renterRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Setup test data
        registerRequest = new RegisterRequest();
        registerRequest.setFullName("Test User");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setContactNumber("+1234567890");
        registerRequest.setRole(UserRole.RENTER);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setFullName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setContactNumber("+1234567890");
        testUser.setRole(UserRole.RENTER);
        testUser.setAuthProvider(AuthProvider.LOCAL);
        testUser.setIsActive(true);
        testUser.setEmailVerified(false);
    }

    @Test
    @DisplayName("Should register new user successfully")
    void testRegister_Success() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(renterRepository.save(any(Renter.class))).thenReturn(new Renter());
        when(jwtTokenProvider.generateTokenFromUsername(anyString())).thenReturn("jwt-token");

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("RENTER", response.getRole());

        verify(userRepository, times(1)).existsByEmail("test@example.com");
        verify(userRepository, times(1)).save(any(User.class));
        verify(renterRepository, times(1)).save(any(Renter.class));
        verify(jwtTokenProvider, times(1)).generateTokenFromUsername("test@example.com");
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void testRegister_EmailAlreadyExists() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.register(registerRequest);
        });

        assertEquals("Email already registered", exception.getMessage());
        verify(userRepository, times(1)).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should login user successfully with valid credentials")
    void testLogin_Success() {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        UserDetailsImpl userDetails = UserDetailsImpl.build(testUser);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtTokenProvider.generateToken(any(Authentication.class))).thenReturn("jwt-token");

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("RENTER", response.getRole());

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtTokenProvider, times(1)).generateToken(any(Authentication.class));
    }

    @Test
    @DisplayName("Should throw exception with invalid credentials")
    void testLogin_InvalidCredentials() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            authService.login(loginRequest);
        });

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtTokenProvider, never()).generateToken(any(Authentication.class));
    }

    @Test
    @DisplayName("Should encode password when registering user")
    void testRegister_PasswordEncoding() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(renterRepository.save(any(Renter.class))).thenReturn(new Renter());
        when(jwtTokenProvider.generateTokenFromUsername(anyString())).thenReturn("jwt-token");

        // Act
        authService.register(registerRequest);

        // Assert
        verify(passwordEncoder, times(1)).encode("password123");
    }

    @Test
    @DisplayName("Should set correct auth provider for local registration")
    void testRegister_AuthProvider() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(jwtTokenProvider.generateTokenFromUsername(anyString())).thenReturn("jwt-token");
        when(renterRepository.save(any(Renter.class))).thenReturn(new Renter());

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertEquals(AuthProvider.LOCAL, user.getAuthProvider());
            return user;
        });

        // Act
        authService.register(registerRequest);

        // Assert
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should create renter record when registering user")
    void testRegister_CreateRenter() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtTokenProvider.generateTokenFromUsername(anyString())).thenReturn("jwt-token");
        when(renterRepository.save(any(Renter.class))).thenReturn(new Renter());

        // Act
        authService.register(registerRequest);

        // Assert
        verify(renterRepository, times(1)).save(any(Renter.class));
    }

    @Test
    @DisplayName("Should return user ID in auth response")
    void testRegister_ReturnsUserId() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(renterRepository.save(any(Renter.class))).thenReturn(new Renter());
        when(jwtTokenProvider.generateTokenFromUsername(anyString())).thenReturn("jwt-token");

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response.getUserId());
        assertEquals(1L, response.getUserId());
    }
}
