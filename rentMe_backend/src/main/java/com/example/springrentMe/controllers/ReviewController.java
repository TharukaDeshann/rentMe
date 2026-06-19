package com.example.springrentMe.controllers;

import com.example.springrentMe.DTOs.CreateReviewRequestDTO;
import com.example.springrentMe.DTOs.PageResponse;
import com.example.springrentMe.DTOs.ReviewResponseDTO;
import com.example.springrentMe.DTOs.VehicleReviewSummaryDTO;
import com.example.springrentMe.services.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    /**
     * POST /api/v1/reviews
     * Create a review for a completed booking.
     * Role required: RENTER only.
     */
    @PreAuthorize("hasRole('RENTER')")
    @PostMapping("/api/v1/reviews")
    public ResponseEntity<ReviewResponseDTO> createReview(@Valid @RequestBody CreateReviewRequestDTO request) {
        ReviewResponseDTO response = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * DELETE /api/v1/reviews/{reviewId}
     * Delete a review.
     * Accessible by: Review Owner (Renter) or Admin.
     */
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/api/v1/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Review deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/public/reviews/vehicle/{vehicleId}
     * Retrieve all reviews for a vehicle (Public).
     */
    @GetMapping("/api/v1/public/reviews/vehicle/{vehicleId}")
    public ResponseEntity<PageResponse<ReviewResponseDTO>> getReviewsByVehicle(
            @PathVariable Long vehicleId,
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(PageResponse.of(reviewService.getReviewsByVehicle(vehicleId, pageable)));
    }

    /**
     * GET /api/v1/public/reviews/vehicle/{vehicleId}/summary
     * Retrieve aggregate summary for a vehicle (Public).
     */
    @GetMapping("/api/v1/public/reviews/vehicle/{vehicleId}/summary")
    public ResponseEntity<VehicleReviewSummaryDTO> getVehicleReviewSummary(@PathVariable Long vehicleId) {
        VehicleReviewSummaryDTO summary = reviewService.getVehicleReviewSummary(vehicleId);
        return ResponseEntity.ok(summary);
    }

    /**
     * GET /api/v1/public/reviews/owner/{ownerId}/average
     * Retrieve average rating for an owner across all their vehicles (Public).
     */
    @GetMapping("/api/v1/public/reviews/owner/{ownerId}/average")
    public ResponseEntity<Double> getVehicleOwnerAverageRating(@PathVariable Long ownerId) {
        Double average = reviewService.getVehicleOwnerAverageRating(ownerId);
        return ResponseEntity.ok(average);
    }

    /**
     * GET /api/v1/admin/reviews
     * Retrieve all reviews for admin moderation.
     * Role required: ADMIN only.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/v1/admin/reviews")
    public ResponseEntity<PageResponse<ReviewResponseDTO>> getAllReviewsAdmin(
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(PageResponse.of(reviewService.getAllReviews(pageable)));
    }
}
