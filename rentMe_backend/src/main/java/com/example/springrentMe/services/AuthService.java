package com.example.springrentMe.services;

import com.example.springrentMe.DTOs.AuthResponse;
import com.example.springrentMe.DTOs.LoginRequest;
import com.example.springrentMe.DTOs.RegisterRequest;
import com.example.springrentMe.models.AuthProvider;
import com.example.springrentMe.models.Admin;
import com.example.springrentMe.models.Renter;
import com.example.springrentMe.models.User;
import com.example.springrentMe.models.UserRole;
import com.example.springrentMe.models.VehicleOwner;
import com.example.springrentMe.models.VerificationStatus;
import com.example.springrentMe.repositories.AdminRepository;
import com.example.springrentMe.repositories.RenterRepository;
import com.example.springrentMe.repositories.UserRepository;
import com.example.springrentMe.repositories.VehicleOwnerRepository;
import com.example.springrentMe.security.UserDetailsImpl;
import com.example.springrentMe.utils.JwtTokenProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;

    private final RenterRepository renterRepository;

    private final VehicleOwnerRepository vehicleOwnerRepository;

    private final AdminRepository adminRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtTokenProvider jwtTokenProvider;

    private final AuthenticationManager authenticationManager;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    public AuthService(UserRepository userRepository,
            RenterRepository renterRepository,
            VehicleOwnerRepository vehicleOwnerRepository,
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.renterRepository = renterRepository;
        this.vehicleOwnerRepository = vehicleOwnerRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Register a new user with LOCAL authentication
     * Creates a role-specific record based on the requested role
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate email doesn't already exist
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        UserRole requestedRole = request.getRole() != null ? request.getRole() : UserRole.RENTER;

        // Create new user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Hash password
        user.setContactNumber(request.getContactNumber());
        user.setRole(requestedRole);
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setIsActive(true);
        user.setEmailVerified(false); // Email verification can be added later

        // Save user to database
        User savedUser = userRepository.save(user);

        // Create role-specific record
        if (requestedRole == UserRole.VEHICLE_OWNER) {
            VehicleOwner vehicleOwner = new VehicleOwner();
            vehicleOwner.setUser(savedUser);
            vehicleOwner.setVerificationStatus(VerificationStatus.NOT_SUBMITTED);
            vehicleOwnerRepository.save(vehicleOwner);
        } else if (requestedRole == UserRole.ADMIN) {
            Admin admin = new Admin();
            admin.setUser(savedUser);
            adminRepository.save(admin);
        } else {
            Renter renter = new Renter();
            renter.setUser(savedUser);
            renterRepository.save(renter);
        }

        // Return response
        return new AuthResponse(
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
     * Verifies Google ID token, creates/updates user, and generates JWT
     * 
     * @param googleToken The Google ID token from frontend
     * @return AuthResponse containing JWT and user details
     */
    @Transactional
    public AuthResponse googleLogin(String googleToken) {
        try {
            // 1. Verify Google token and extract user info
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(googleToken);
            if (idToken == null) {
                throw new RuntimeException("Invalid Google token");
            }

            Payload payload = idToken.getPayload();

            // Extract user information from Google token
            String googleId = payload.getSubject(); // Unique Google user ID
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String profilePicture = (String) payload.get("picture");
            Boolean emailVerified = payload.getEmailVerified();

            // 2. Check if user already exists
            Optional<User> existingUserOpt = userRepository.findByEmail(email);
            User user;
            boolean isNewUser;

            if (existingUserOpt.isPresent()) {
                // User exists - update their information if needed
                user = existingUserOpt.get();
                isNewUser = false;

                // Update OAuth-related fields
                if (user.getOauthId() == null) {
                    user.setOauthId(googleId);
                }
                if (user.getAuthProvider() == AuthProvider.LOCAL) {
                    // User previously used local auth, now using Google
                    user.setAuthProvider(AuthProvider.GOOGLE);
                }
                if (user.getProfilePicture() == null && profilePicture != null) {
                    user.setProfilePicture(profilePicture);
                }
                user.setEmailVerified(emailVerified != null ? emailVerified : true);

                userRepository.save(user);
            } else {
                // 3. Create new user with Google OAuth (role will be confirmed via role selection)
                user = new User();
                user.setFullName(name);
                user.setEmail(email);
                user.setPassword(null); // No password for OAuth users
                user.setContactNumber("0000000000"); // Placeholder - user can update later in profile
                user.setRole(UserRole.RENTER); // Default role (will be updated if user picks VEHICLE_OWNER)
                user.setAuthProvider(AuthProvider.GOOGLE);
                user.setOauthId(googleId);
                user.setProfilePicture(profilePicture);
                user.setEmailVerified(emailVerified != null ? emailVerified : true);
                user.setIsActive(true);

                // Save user to database
                User savedUser = userRepository.save(user);

                // Create default Renter record (will be replaced if user selects VEHICLE_OWNER)
                Renter renter = new Renter();
                renter.setUser(savedUser);
                renterRepository.save(renter);

                user = savedUser;
                isNewUser = true;
            }

            // 4. Generate JWT token for the user
            String jwtToken = jwtTokenProvider.generateTokenFromUsername(user.getEmail());

            // 5. Return response with isNewUser flag
            return new AuthResponse(
                    jwtToken,
                    user.getUserId(),
                    user.getEmail(),
                    user.getRole().name(),
                    isNewUser);

        } catch (Exception e) {
            throw new RuntimeException("Failed to authenticate with Google: " + e.getMessage(), e);
        }
    }


    /**
     * Generate a JWT token for a user identified by email.
     * Used when refreshing cookies after role changes.
     */
    public String generateTokenForUser(String email) {
        return jwtTokenProvider.generateTokenFromUsername(email);
    }

    /**
     * Complete OAuth2 registration by assigning a role to a new Google user.
     * Called when a new Google Sign-In user selects their role (RENTER or VEHICLE_OWNER).
     *
     * @param userId The ID of the user to update
     * @param role   The selected role (RENTER or VEHICLE_OWNER)
     */
    @Transactional
    public void completeOAuth2Registration(Long userId, UserRole role) {
        // Only allow RENTER or VEHICLE_OWNER (not ADMIN) via self-selection
        if (role == UserRole.ADMIN) {
            throw new RuntimeException("Cannot self-assign ADMIN role");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify this is actually a Google OAuth user
        if (user.getAuthProvider() != AuthProvider.GOOGLE) {
            throw new RuntimeException("This endpoint is only for OAuth2 users");
        }

        // Update user's role
        user.setRole(role);
        userRepository.save(user);

        // Create role-specific record if not already present
        if (role == UserRole.VEHICLE_OWNER) {
            boolean ownerExists = vehicleOwnerRepository.findByUser_UserId(user.getUserId()).isPresent();
            if (!ownerExists) {
                // Remove renter record if it exists
                renterRepository.findByUser_UserId(user.getUserId()).ifPresent(renterRepository::delete);

                VehicleOwner vehicleOwner = new VehicleOwner();
                vehicleOwner.setUser(user);
                vehicleOwner.setVerificationStatus(VerificationStatus.NOT_SUBMITTED);
                vehicleOwnerRepository.save(vehicleOwner);
            }
        } else {
            // RENTER
            boolean renterExists = renterRepository.findByUser_UserId(user.getUserId()).isPresent();
            if (!renterExists) {
                Renter renter = new Renter();
                renter.setUser(user);
                renterRepository.save(renter);
            }
        }
    }
}
