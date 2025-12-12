package com.example.springrentMe.security.oauth2;

import com.example.springrentMe.models.User;
import com.example.springrentMe.repositories.UserRepository;
import com.example.springrentMe.utils.CookieUtils;
import com.example.springrentMe.utils.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Handles successful OAuth2 authentication.
 * After Google authenticates the user, this handler:
 * 1. Extracts user info from OAuth2User
 * 2. Generates a JWT token
 * 3. Sets token in HTTP-only cookie (SECURE) using CookieUtils
 * 4. Redirects to frontend
 */
@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

        private final JwtTokenProvider jwtTokenProvider;
        private final UserRepository userRepository;

        public OAuth2LoginSuccessHandler(JwtTokenProvider jwtTokenProvider,
                        UserRepository userRepository) {
                this.jwtTokenProvider = jwtTokenProvider;
                this.userRepository = userRepository;
        }

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

                // Set authentication cookies using centralized utility
                CookieUtils.setAuthCookies(response, token, user);

                // Redirect to frontend WITHOUT token in URL (SECURE)
                String redirectUrl = frontendUrl + "/oauth2/redirect?success=true";
                getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        }
}
