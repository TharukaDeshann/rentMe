package com.example.springrentMe.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleReviewSummaryDTO {

    private Long vehicleId;
    private Double averageRating;
    private Long totalReviews;
}
