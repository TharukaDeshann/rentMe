package com.example.springrentMe.security.oauth2;

import java.util.Map;

/**
 * Google OAuth2 user info extractor.
 * Google returns user data in this format:
 * {
 * "sub": "1234567890", // Unique Google user ID
 * "name": "John Doe", // Full name
 * "email": "john@example.com",
 * "picture": "https://..." // Profile picture URL
 * }
 */
public class GoogleOAuth2UserInfo extends OAuth2UserInfo {

    public GoogleOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getId() {
        return (String) attributes.get("sub"); // Google uses "sub" for user ID
    }

    @Override
    public String getName() {
        return (String) attributes.get("name");
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getImageUrl() {
        return (String) attributes.get("picture");
    }
}
