package com.example.springrentMe.DTOs;

import com.example.springrentMe.models.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for completing OAuth2 user registration by selecting a role.
 * Used when a new Google Sign-In user chooses whether to be a RENTER or VEHICLE_OWNER.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteOAuth2RegistrationRequest {

    @NotNull(message = "Role is required")
    private UserRole role; // RENTER or VEHICLE_OWNER only (ADMIN cannot be selected via OAuth)
}
