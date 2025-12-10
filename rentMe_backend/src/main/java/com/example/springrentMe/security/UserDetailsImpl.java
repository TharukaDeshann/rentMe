package com.example.springrentMe.security;

import com.example.springrentMe.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * Adapter class that converts our User entity to Spring Security's UserDetails
 * interface.
 * This is the Adapter Design Pattern in action!
 */
@Data
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {

    private Long id;
    private String email;
    private String password;
    private String role;
    private Boolean isActive;

    // Factory method to create UserDetailsImpl from User entity
    public static UserDetailsImpl build(User user) {
        return new UserDetailsImpl(
                user.getUserId(),
                user.getEmail(),
                user.getPassword(),
                user.getRole().name(),
                user.getIsActive());
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
}
