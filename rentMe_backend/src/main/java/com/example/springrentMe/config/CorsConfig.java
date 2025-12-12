package com.example.springrentMe.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * Allows frontend (running on different port/domain) to access backend APIs
 * Enables cookie-based authentication across origins
 */
@Configuration
public class CorsConfig {

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow frontend URL (important for OAuth2 redirects)
        configuration.setAllowedOrigins(Arrays.asList(frontendUrl));

        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // Allow common HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Allow common headers
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With"));

        // Expose headers that frontend can read
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Set-Cookie"));

        // Cache preflight requests for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
