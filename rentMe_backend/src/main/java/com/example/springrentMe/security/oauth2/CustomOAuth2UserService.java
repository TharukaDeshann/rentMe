package com.example.springrentMe.security.oauth2;

import com.example.springrentMe.models.AuthProvider;
import com.example.springrentMe.models.Renter;
import com.example.springrentMe.models.User;
import com.example.springrentMe.models.UserRole;
import com.example.springrentMe.repositories.RenterRepository;
import com.example.springrentMe.repositories.UserRepository;
import com.example.springrentMe.security.UserDetailsImpl;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;

/**
 * Custom OAuth2 user service that loads or creates users from OAuth2 providers.
 * This is called automatically by Spring Security after successful OAuth2
 * authentication.
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    private final RenterRepository renterRepository;

    public CustomOAuth2UserService(UserRepository userRepository, RenterRepository renterRepository) {
        this.userRepository = userRepository;
        this.renterRepository = renterRepository;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // Get OAuth2 user info from provider (Google)
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            // Throwing an instance of AuthenticationException will trigger the
            // OAuth2AuthenticationFailureHandler
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    @Transactional
    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        // Extract user info using factory pattern
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
                registrationId,
                oAuth2User.getAttributes());

        // Validate email exists
        if (!StringUtils.hasText(oAuth2UserInfo.getEmail())) {
            throw new RuntimeException("Email not found from OAuth2 provider");
        }

        // Check if user already exists
        Optional<User> userOptional = userRepository.findByEmail(oAuth2UserInfo.getEmail());
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();

            // Check if user registered with different provider
            if (!user.getAuthProvider().name().equals(registrationId.toUpperCase())) {
                throw new RuntimeException("You're already registered with " + user.getAuthProvider() +
                        ". Please use that account to login.");
            }

            // Update existing user if needed
            user = updateExistingUser(user, oAuth2UserInfo);
        } else {
            // Register new OAuth2 user
            user = registerNewUser(registrationId, oAuth2UserInfo);
        }

        // Return UserDetailsImpl which implements both UserDetails and OAuth2User
        return UserDetailsImpl.create(user, oAuth2User.getAttributes());
    }

    private User registerNewUser(String registrationId, OAuth2UserInfo oAuth2UserInfo) {
        User user = new User();
        user.setAuthProvider(AuthProvider.valueOf(registrationId.toUpperCase()));
        user.setOauthId(oAuth2UserInfo.getId());
        user.setFullName(oAuth2UserInfo.getName());
        user.setEmail(oAuth2UserInfo.getEmail());
        user.setProfilePicture(oAuth2UserInfo.getImageUrl());
        user.setEmailVerified(true); // OAuth users are pre-verified
        user.setIsActive(true);
        user.setRole(UserRole.RENTER); // Default role for new OAuth users
        user.setContactNumber(""); // Required field - can be updated later

        // Save user first to get the user_id
        User savedUser = userRepository.save(user);

        // Create corresponding Renter record (every user is a renter by default)
        Renter renter = new Renter();
        renter.setUser(savedUser);
        renterRepository.save(renter);

        return savedUser;
    }

    private User updateExistingUser(User existingUser, OAuth2UserInfo oAuth2UserInfo) {
        // Update name and profile picture if changed
        existingUser.setFullName(oAuth2UserInfo.getName());
        existingUser.setProfilePicture(oAuth2UserInfo.getImageUrl());

        return userRepository.save(existingUser);
    }
}
