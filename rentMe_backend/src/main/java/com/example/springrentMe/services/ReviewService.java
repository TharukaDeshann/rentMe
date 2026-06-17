package com.example.springrentMe.services;

import com.example.springrentMe.DTOs.CreateReviewRequestDTO;
import com.example.springrentMe.DTOs.ReviewResponseDTO;
import com.example.springrentMe.DTOs.VehicleReviewSummaryDTO;
import com.example.springrentMe.exceptions.BookingNotCompletedException;
import com.example.springrentMe.exceptions.DuplicateReviewException;
import com.example.springrentMe.exceptions.ReviewValidationException;
import com.example.springrentMe.exceptions.UnauthorizedReviewException;
import com.example.springrentMe.models.*;
import com.example.springrentMe.repositories.BookingRepository;
import com.example.springrentMe.repositories.ReviewRepository;
import com.example.springrentMe.repositories.VehicleOwnerRepository;
import com.example.springrentMe.repositories.VehicleRepository;
import com.example.springrentMe.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleOwnerRepository vehicleOwnerRepository;

    /**
     * Create a new review for a booking.
     * Enforces rules:
     * - Booking status = COMPLETED
     * - Reviewer is the renter of the booking
     * - Rating is 1-5
     * - One review per booking
     */
    @Transactional
    public ReviewResponseDTO createReview(CreateReviewRequestDTO request) {
        Long currentUserId = getCurrentUserId();

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ReviewValidationException("Booking not found with ID: " + request.getBookingId()));

        // 1. Booking must be COMPLETED
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BookingNotCompletedException("Cannot review vehicle for a booking that is not completed. Current status: " + booking.getStatus());
        }

        // 2. Reviewer must be the booking renter
        Long renterUserId = booking.getRenter().getUser().getUserId();
        if (!renterUserId.equals(currentUserId)) {
            throw new UnauthorizedReviewException("You do not have permission to review this booking.");
        }

        // 3. Rating must be between 1 and 5
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new ReviewValidationException("Rating must be between 1 and 5.");
        }

        // 4. One review per booking (Unique check)
        if (reviewRepository.existsByBooking_BookingId(request.getBookingId())) {
            throw new DuplicateReviewException("A review already exists for this booking.");
        }

        Review review = new Review();
        review.setBooking(booking);
        review.setVehicle(booking.getVehicle());
        review.setVehicleOwner(booking.getVehicle().getVehicleOwner());
        review.setReviewer(booking.getRenter().getUser());
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review savedReview = reviewRepository.save(review);

        // Update aggregations
        updateVehicleAggregates(booking.getVehicle().getVehicleId());
        updateVehicleOwnerAggregates(booking.getVehicle().getVehicleOwner().getVehicleOwnerId());

        return convertToResponseDTO(savedReview);
    }

    /**
     * Delete a review. Authorized for the owner of the review or ADMIN.
     */
    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewValidationException("Review not found with ID: " + reviewId));

        Long currentUserId = getCurrentUserId();
        boolean isAdmin = currentUserIsAdmin();

        // Only review owner or admin can delete
        if (!review.getReviewer().getUserId().equals(currentUserId) && !isAdmin) {
            throw new UnauthorizedReviewException("You do not have permission to delete this review.");
        }

        Long vehicleId = review.getVehicle().getVehicleId();
        Long ownerId = review.getVehicleOwner().getVehicleOwnerId();

        reviewRepository.delete(review);

        // Recompute aggregates
        updateVehicleAggregates(vehicleId);
        updateVehicleOwnerAggregates(ownerId);
    }

    /**
     * Get reviews list by Vehicle ID
     */
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByVehicle(Long vehicleId) {
        return reviewRepository.findByVehicle_VehicleIdOrderByCreatedAtDesc(vehicleId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get vehicle average rating
     */
    @Transactional(readOnly = true)
    public Double getVehicleAverageRating(Long vehicleId) {
        Double avg = reviewRepository.getAverageRatingByVehicle(vehicleId);
        return avg != null ? avg : 0.0;
    }

    /**
     * Get owner average rating across all their vehicles
     */
    @Transactional(readOnly = true)
    public Double getVehicleOwnerAverageRating(Long vehicleOwnerId) {
        Double avg = reviewRepository.getAverageRatingByOwner(vehicleOwnerId);
        return avg != null ? avg : 0.0;
    }

    /**
     * Get vehicle review summary DTO
     */
    @Transactional(readOnly = true)
    public VehicleReviewSummaryDTO getVehicleReviewSummary(Long vehicleId) {
        Double avg = getVehicleAverageRating(vehicleId);
        Long count = reviewRepository.countByVehicle(vehicleId);
        return new VehicleReviewSummaryDTO(vehicleId, avg, count != null ? count : 0L);
    }

    /**
     * Get all reviews in the system (useful for admin moderation)
     */
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private void updateVehicleAggregates(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ReviewValidationException("Vehicle not found with ID: " + vehicleId));

        Double avg = reviewRepository.getAverageRatingByVehicle(vehicleId);
        Long count = reviewRepository.countByVehicle(vehicleId);

        vehicle.setAverageRating(avg != null ? avg : 0.0);
        vehicle.setTotalReviews(count != null ? count : 0L);
        vehicleRepository.save(vehicle);
    }

    private void updateVehicleOwnerAggregates(Long ownerId) {
        VehicleOwner owner = vehicleOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new ReviewValidationException("Vehicle owner not found with ID: " + ownerId));

        Double avg = reviewRepository.getAverageRatingByOwner(ownerId);
        Long count = reviewRepository.countByOwner(ownerId);

        owner.setAverageRating(avg != null ? avg : 0.0);
        owner.setTotalReviews(count != null ? count : 0L);
        vehicleOwnerRepository.save(owner);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedReviewException("You must be authenticated to perform this action.");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) principal).getId();
        }
        throw new UnauthorizedReviewException("Invalid authentication details.");
    }

    private boolean currentUserIsAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private ReviewResponseDTO convertToResponseDTO(Review review) {
        ReviewResponseDTO dto = new ReviewResponseDTO();
        dto.setReviewId(review.getReviewId());
        dto.setBookingId(review.getBooking().getBookingId());
        dto.setVehicleId(review.getVehicle().getVehicleId());
        dto.setVehicleOwnerId(review.getVehicleOwner().getVehicleOwnerId());
        dto.setReviewerId(review.getReviewer().getUserId());
        dto.setReviewerName(review.getReviewer().getFullName());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
