package com.example.springrentMe.security.oauth2;

import com.example.springrentMe.models.AuthProvider;

import java.util.Map;

/**
 * Factory to create the appropriate OAuth2UserInfo based on the provider.
 */
public class OAuth2UserInfoFactory {

    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if (registrationId.equalsIgnoreCase(AuthProvider.GOOGLE.name())) {
            return new GoogleOAuth2UserInfo(attributes);
        } else {
            throw new IllegalArgumentException("Login with " + registrationId + " is not supported yet.");
        }
    }
}
