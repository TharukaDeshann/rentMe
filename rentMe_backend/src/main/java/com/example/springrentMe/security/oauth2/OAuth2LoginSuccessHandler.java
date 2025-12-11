package com.example.springrentMe.security.oauth2;

import com.example.springrentMe.models.User;
import com.example.springrentMe.repositories.UserRepository;
import com.example.springrentMe.utils.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * Handles successful OAuth2 authentication.
 * After Google authenticates the user, this handler:
 * 1. Extracts user info from OAuth2User
 * 2. Generates a JWT token
 * 3. Redirects to frontend with the token
 */
@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

        @Autowired
        private JwtTokenProvider jwtTokenProvider;

        @Autowired
        private UserRepository userRepository;

        @Value("${FRONTEND_URL:http://localhost:3000}")
        private String frontendUrl;

        @Override
        public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                        Authentication authentication) throws IOException, ServletException {

                OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
                String email = oAuth2User.getAttribute("email");

                // Find user in database (should exist - created by CustomOAuth2UserService)
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found after OAuth2 login"));

                // Generate JWT token
                String token = jwtTokenProvider.generateTokenFromUsername(email);

                // Redirect to frontend with token (uses environment variable)
                String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                                .queryParam("token", token)
                                .queryParam("userId", user.getUserId())
                                .queryParam("email", user.getEmail())
                                .queryParam("role", user.getRole().name())
                                .build().toUriString();

                getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        }
}
