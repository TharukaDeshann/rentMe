package com.example.springrentMe.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {

    private Long reviewId;
    private Long bookingId;

    private Long vehicleId;
    private Long vehicleOwnerId;

    private Long reviewerId;
    private String reviewerName;

    private Integer rating;
    private String comment;

    private LocalDateTime createdAt;
}
