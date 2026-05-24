package com.example.springrentMe.DTOs;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for the owner to manually toggle vehicle availability or listing status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleAvailabilityUpdateDTO {

    // If not null, override the availability flag
    private Boolean isAvailable;

    // If not null, override the listing visibility flag
    private Boolean isListed;
}