package com.example.springrentMe.security;

import com.example.springrentMe.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.*;

/**
 * Adapter class that converts our User entity to Spring Security's UserDetails
 * interface. Also implements OAuth2User for OAuth2 authentication support.
 * This is the Adapter Design Pattern in action!
 * 
 * NOTE: A user can have multiple roles simultaneously (RENTER, VEHICLE_OWNER,
 * ADMIN)
 */
@Data
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails, OAuth2User {

    private Long id;
    private String email;
    private String password;
    private String role; // Primary role from User table
    private Boolean isActive;
    private Boolean hasRenterRole;
    private Boolean hasVehicleOwnerRole;
    private Boolean hasAdminRole;
    private Map<String, Object> attributes; // OAuth2 attributes

    // Factory method to create UserDetailsImpl from User entity (for local auth)
    public static UserDetailsImpl build(User user) {
        return new UserDetailsImpl(
                user.getUserId(),
                user.getEmail(),
                user.getPassword(),
                user.getRole().name(),
                user.getIsActive(),
                false, // These will be set by CustomUserDetailsService
                false,
                false,
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
        // Users can have multiple roles simultaneously
        Set<GrantedAuthority> authorities = new HashSet<>();

        // Every user has their primary role
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));

        // Add RENTER role if they have a renter record
        if (hasRenterRole) {
            authorities.add(new SimpleGrantedAuthority("ROLE_RENTER"));
        }

        // Add VEHICLE_OWNER role if they have a vehicle owner record
        if (hasVehicleOwnerRole) {
            authorities.add(new SimpleGrantedAuthority("ROLE_VEHICLE_OWNER"));
        }

        // Add ADMIN role if they have an admin record
        if (hasAdminRole) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        return authorities;
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
