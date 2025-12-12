package com.example.springrentMe.utils;

import com.example.springrentMe.models.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Utility class for managing authentication cookies.
 * Centralizes cookie creation, modification, and deletion to ensure consistency
 * across the application and follow DRY principles.
 */
public class CookieUtils {

    // Cookie names
    private static final String JWT_COOKIE_NAME = "jwt_token";
    private static final String USER_INFO_COOKIE_NAME = "user_info";

    // Cookie configuration
    private static final int COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds
    private static final boolean IS_SECURE = false; // Set to true for production HTTPS
    private static final String COOKIE_PATH = "/";

    /**
     * Sets authentication cookies (JWT token + user info) in the response.
     * This method is used after successful login (local or OAuth2).
     * 
     * @param response HTTP response to add cookies to
     * @param jwtToken JWT token string
     * @param user     User entity containing user details
     */
    public static void setAuthCookies(HttpServletResponse response, String jwtToken, User user) {
        // Create and add JWT cookie (HTTP-only for security)
        Cookie jwtCookie = createJwtCookie(jwtToken);
        response.addCookie(jwtCookie);

        // Create and add user info cookie (accessible to JavaScript)
        Cookie userInfoCookie = createUserInfoCookie(user);
        response.addCookie(userInfoCookie);
    }

    /**
     * Creates an HTTP-only cookie for storing the JWT token.
     * This cookie is secure against XSS attacks as JavaScript cannot access it.
     * 
     * @param token JWT token string
     * @return Cookie configured for JWT storage
     */
    private static Cookie createJwtCookie(String token) {
        Cookie cookie = new Cookie(JWT_COOKIE_NAME, token);
        cookie.setHttpOnly(true); // Prevents JavaScript access (XSS protection)
        cookie.setSecure(IS_SECURE); // Only sent over HTTPS in production
        cookie.setPath(COOKIE_PATH);
        cookie.setMaxAge(COOKIE_MAX_AGE);
        cookie.setAttribute("SameSite", "Lax"); // CSRF protection
        return cookie;
    }

    /**
     * Creates a non-HTTP-only cookie for storing user information.
     * This cookie is accessible to JavaScript for frontend convenience.
     * Contains non-sensitive data: userId, email, and role.
     * 
     * @param user User entity containing user details
     * @return Cookie configured for user info storage
     */
    private static Cookie createUserInfoCookie(User user) {
        // Create JSON string with user information
        String userInfo = String.format("{\"userId\":%d,\"email\":\"%s\",\"role\":\"%s\"}",
                user.getUserId(),
                user.getEmail(),
                user.getRole().name());

        // URL encode to avoid special character issues in cookies
        String encodedUserInfo = URLEncoder.encode(userInfo, StandardCharsets.UTF_8);

        Cookie cookie = new Cookie(USER_INFO_COOKIE_NAME, encodedUserInfo);
        cookie.setHttpOnly(false); // Accessible to JavaScript
        cookie.setSecure(IS_SECURE);
        cookie.setPath(COOKIE_PATH);
        cookie.setMaxAge(COOKIE_MAX_AGE);
        return cookie;
    }

    /**
     * Clears authentication cookies by setting their max age to 0.
     * Used during logout to remove user session.
     * 
     * @param response HTTP response to add cookie deletion commands to
     */
    public static void clearAuthCookies(HttpServletResponse response) {
        // Clear JWT cookie
        Cookie jwtCookie = new Cookie(JWT_COOKIE_NAME, null);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(IS_SECURE);
        jwtCookie.setPath(COOKIE_PATH);
        jwtCookie.setMaxAge(0); // Delete cookie
        response.addCookie(jwtCookie);

        // Clear user info cookie
        Cookie userInfoCookie = new Cookie(USER_INFO_COOKIE_NAME, null);
        userInfoCookie.setHttpOnly(false);
        userInfoCookie.setSecure(IS_SECURE);
        userInfoCookie.setPath(COOKIE_PATH);
        userInfoCookie.setMaxAge(0); // Delete cookie
        response.addCookie(userInfoCookie);
    }

    /**
     * Gets the configured cookie max age in seconds.
     * Useful for frontend to know when cookies expire.
     * 
     * @return Cookie max age in seconds
     */
    public static int getCookieMaxAge() {
        return COOKIE_MAX_AGE;
    }
}
