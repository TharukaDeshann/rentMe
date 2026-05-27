package com.example.springrentMe.DTOs;

import com.example.springrentMe.models.VehicleType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for creating or updating a vehicle listing.
 * Used by VEHICLE_OWNER role only.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequestDTO {

    @NotBlank(message = "Make is required")
    @Size(max = 100, message = "Make must not exceed 100 characters")
    private String make;

    @NotBlank(message = "Model is required")
    @Size(max = 100, message = "Model must not exceed 100 characters")
    private String model;

    @NotNull(message = "Vehicle type is required")
    private VehicleType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 50, message = "Capacity must not exceed 50")
    private Integer capacity;

    @NotNull(message = "Daily price is required")
    @DecimalMin(value = "0.01", message = "Daily price must be greater than 0")
    private BigDecimal dailyPrice;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    // Cloudinary URL string or comma-separated list of URLs
    private String pictures;

    // JSON string: {"registration": "url", "insurance": "url"}
    private String legalDocuments;

    @NotBlank(message = "Pickup location is required")
    @Size(max = 255)
    private String pickupLocation;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0",  message = "Latitude must be between -90 and 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0",  message = "Longitude must be between -180 and 180")
    private Double longitude;

    // Optional on create (defaults to true), useful for update
    private Boolean isAvailable;

    // Visibility toggle – owner can hide a listing without deleting it
    private Boolean isListed;
}