package com.example.springrentMe.DTOs;

import com.example.springrentMe.models.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO returned for all booking read operations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {

    private Long bookingId;
    private BookingStatus status;

    // Dates
    private LocalDate startDate;
    private LocalDate endDate;
    private long numberOfDays;

    // Financials
    private BigDecimal dailyPrice;
    private BigDecimal totalAmount;

    // Notes
    private String notes;
    private String cancellationReason;

    // Vehicle summary
    private Long vehicleId;
    private String vehicleMake;
    private String vehicleModel;
    private String vehicleType;
    private String vehiclePickupLocation;
    private String vehiclePictures;

    // Renter summary
    private Long renterId;
    private String renterName;
    private String renterEmail;
    private String renterContactNumber;

    // Owner summary
    private Long vehicleOwnerId;
    private String ownerName;
    private String ownerEmail;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}