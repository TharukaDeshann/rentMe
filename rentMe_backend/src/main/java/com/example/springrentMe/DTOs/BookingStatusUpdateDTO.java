package com.example.springrentMe.DTOs;

import com.example.springrentMe.models.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO used to update a booking's status.
 *
 * Owner actions : APPROVED or CANCELLED (reject)
 * Renter action : CANCELLED (cancel own pending request)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusUpdateDTO {

    @NotNull(message = "New status is required")
    private BookingStatus newStatus;

    // Optional reason when cancelling / rejecting
    private String cancellationReason;
}