package com.example.springrentMe.security;

import com.example.springrentMe.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

/**
 * Adapter class that converts our User entity to Spring Security's UserDetails
 * interface. Also implements OAuth2User for OAuth2 authentication support.
 * This is the Adapter Design Pattern in action!
 */
@Data
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails, OAuth2User {

    private Long id;
    private String email;
    private String password;
    private String role;
    private Boolean isActive;
    private Map<String, Object> attributes; // OAuth2 attributes

    // Factory method to create UserDetailsImpl from User entity (for local auth)
    public static UserDetailsImpl build(User user) {
        return new UserDetailsImpl(
                user.getUserId(),
                user.getEmail(),
                user.getPassword(),
                user.getRole().name(),
                user.getIsActive(),
                null); // No OAuth2 attributes for local auth
    }

    // Factory method to create UserDetailsImpl from User entity with OAuth2
    // attributes
    public static UserDetailsImpl create(User user, Map<String, Object> attributes) {
        UserDetailsImpl userDetails = build(user);
        userDetails.setAttributes(attributes);
        return userDetails;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convert our UserRole enum to Spring Security authority
        // RENTER → ROLE_RENTER, OWNER → ROLE_OWNER, ADMIN → ROLE_ADMIN
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        // In our system, email is the username
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // We don't track account expiration
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive; // Map our isActive field to Spring Security's lock status
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // We don't track credential expiration
    }

    @Override
    public boolean isEnabled() {
        return isActive; // Account is enabled if it's active
    }

    // OAuth2User methods
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        return String.valueOf(id); // Return user ID as name
    }
}
