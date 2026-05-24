package com.example.springrentMe.DTOs;

import com.example.springrentMe.models.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO returned for vehicle read operations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponseDTO {

    private Long vehicleId;
    private String make;
    private String model;
    private VehicleType type;
    private Integer capacity;
    private BigDecimal dailyPrice;
    private String description;
    private String pictures;
    private String legalDocuments;
    private String pickupLocation;
    private Double latitude;
    private Double longitude;
    private Boolean isAvailable;
    private Boolean isListed;

    // Owner summary (avoid exposing full owner object)
    private Long vehicleOwnerId;
    private String ownerName;
    private String ownerEmail;
    private String ownerContactNumber;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}