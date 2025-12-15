package com.example.springrentMe.DTOs;

import com.example.springrentMe.models.AuthProvider;
import com.example.springrentMe.models.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO for user information responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long userId;
    private String fullName;
    private String email;
    private String contactNumber;
    private UserRole role;
    private String profilePicture;
    private LocalDate dateOfBirth;
    private AuthProvider authProvider;
    private Boolean emailVerified;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // All roles the user has (can have multiple: RENTER, VEHICLE_OWNER, ADMIN)
    private Set<String> roles;
    private String verificationStatus; // For vehicle owners

    // Location information
    private LocationDTO location;
}
