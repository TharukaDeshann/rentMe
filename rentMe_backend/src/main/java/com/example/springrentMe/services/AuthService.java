package com.example.springrentMe.services;

import com.example.springrentMe.DTOs.AuthResponse;
import com.example.springrentMe.DTOs.LoginRequest;
import com.example.springrentMe.DTOs.RegisterRequest;
import com.example.springrentMe.models.AuthProvider;
import com.example.springrentMe.models.User;
import com.example.springrentMe.repositories.UserRepository;
import com.example.springrentMe.security.UserDetailsImpl;
import com.example.springrentMe.utils.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtTokenProvider jwtTokenProvider;

    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Register a new user with LOCAL authentication
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate email doesn't already exist
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Hash password
        user.setContactNumber(request.getContactNumber());
        user.setRole(request.getRole());
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setIsActive(true);
        user.setEmailVerified(false); // Email verification can be added later

        // Save to database
        User savedUser = userRepository.save(user);

        // Generate JWT token
        String token = jwtTokenProvider.generateTokenFromUsername(savedUser.getEmail());

        // Return response
        return new AuthResponse(
                token,
                savedUser.getUserId(),
                savedUser.getEmail(),
                savedUser.getRole().name());
    }

    /**
     * Login with email and password
     */
    public AuthResponse login(LoginRequest request) {
        // Authenticate user (this triggers CustomUserDetailsService.loadUserByUsername)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        // Set authentication in security context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(authentication);

        // Get user details
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Return response
        return new AuthResponse(
                token,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getRole());
    }

    /**
     * Handle Google OAuth login
     * (Implementation depends on OAuth flow - we'll add this later)
     */
    @Transactional
    public AuthResponse googleLogin(String googleToken) {
        // TODO: Verify Google token, extract user info
        // TODO: Check if user exists, if not create new user
        // TODO: Generate JWT token
        throw new UnsupportedOperationException("Google OAuth not yet implemented");
    }
}
