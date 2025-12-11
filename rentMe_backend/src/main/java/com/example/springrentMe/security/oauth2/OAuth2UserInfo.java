package com.example.springrentMe.security.oauth2;

import java.util.Map;

/**
 * Abstract interface for extracting user info from different OAuth2 providers.
 * Each provider (Google, Facebook, etc.) returns user data in different
 * formats.
 * This interface standardizes the extraction.
 */
public abstract class OAuth2UserInfo {

    protected Map<String, Object> attributes;

    public OAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public Map<String, Object> getAttributes() {
        return attributes;
    }

    public abstract String getId(); // Provider's unique user ID

    public abstract String getName(); // Full name

    public abstract String getEmail();

    public abstract String getImageUrl(); // Profile picture
}
