package com.example.springrentMe.services;

import com.example.springrentMe.DTOs.CreateReviewRequestDTO;
import com.example.springrentMe.DTOs.ReviewResponseDTO;
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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReviewService Tests")
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private VehicleOwnerRepository vehicleOwnerRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ReviewService reviewService;

    private User renterUser;
    private Renter renter;
    private User ownerUser;
    private VehicleOwner owner;
    private Vehicle vehicle;
    private Booking booking;

    @BeforeEach
    void setUp() {
        // Setup renter
        renterUser = new User();
        renterUser.setUserId(1L);
        renterUser.setFullName("Renter User");
        renterUser.setEmail("renter@example.com");
        renterUser.setRole(UserRole.RENTER);

        renter = new Renter();
        renter.setRenterId(10L);
        renter.setUser(renterUser);

        // Setup owner
        ownerUser = new User();
        ownerUser.setUserId(2L);
        ownerUser.setFullName("Owner User");
        ownerUser.setEmail("owner@example.com");
        ownerUser.setRole(UserRole.VEHICLE_OWNER);

        owner = new VehicleOwner();
        owner.setVehicleOwnerId(20L);
        owner.setUser(ownerUser);

        // Setup vehicle
        vehicle = new Vehicle();
        vehicle.setVehicleId(30L);
        vehicle.setVehicleOwner(owner);
        vehicle.setAverageRating(0.0);
        vehicle.setTotalReviews(0L);

        // Setup booking
        booking = new Booking();
        booking.setBookingId(40L);
        booking.setVehicle(vehicle);
        booking.setRenter(renter);
        booking.setStatus(BookingStatus.COMPLETED);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void mockUser(Long userId, String roleName) {
        UserDetailsImpl userDetails = new UserDetailsImpl(
                userId, "renter@example.com", "password", roleName, true, true, false, false, null
        );
        SecurityContextHolder.setContext(securityContext);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.isAuthenticated()).thenReturn(true);
        lenient().when(authentication.getPrincipal()).thenReturn(userDetails);
        lenient().doReturn(userDetails.getAuthorities()).when(authentication).getAuthorities();
    }

    @Test
    @DisplayName("Should create review successfully and update aggregates")
    void testCreateReview_Success() {
        // Arrange
        mockUser(renterUser.getUserId(), "RENTER");
        CreateReviewRequestDTO request = new CreateReviewRequestDTO(booking.getBookingId(), 5, "Great vehicle!");

        Review savedReview = new Review();
        savedReview.setReviewId(100L);
        savedReview.setBooking(booking);
        savedReview.setVehicle(vehicle);
        savedReview.setVehicleOwner(owner);
        savedReview.setReviewer(renterUser);
        savedReview.setRating(5);
        savedReview.setComment("Great vehicle!");

        when(bookingRepository.findById(booking.getBookingId())).thenReturn(Optional.of(booking));
        when(reviewRepository.existsByBooking_BookingId(booking.getBookingId())).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenReturn(savedReview);

        // Mock aggregates recomputation
        when(vehicleRepository.findById(vehicle.getVehicleId())).thenReturn(Optional.of(vehicle));
        when(reviewRepository.getAverageRatingByVehicle(vehicle.getVehicleId())).thenReturn(5.0);
        when(reviewRepository.countByVehicle(vehicle.getVehicleId())).thenReturn(1L);

        when(vehicleOwnerRepository.findById(owner.getVehicleOwnerId())).thenReturn(Optional.of(owner));
        when(reviewRepository.getAverageRatingByOwner(owner.getVehicleOwnerId())).thenReturn(5.0);
        when(reviewRepository.countByOwner(owner.getVehicleOwnerId())).thenReturn(1L);

        // Act
        ReviewResponseDTO response = reviewService.createReview(request);

        // Assert
        assertNotNull(response);
        assertEquals(100L, response.getReviewId());
        assertEquals(booking.getBookingId(), response.getBookingId());
        assertEquals(5, response.getRating());
        assertEquals("Great vehicle!", response.getComment());

        // Verify entities got updated with aggregates
        assertEquals(5.0, vehicle.getAverageRating());
        assertEquals(1L, vehicle.getTotalReviews());
        assertEquals(5.0, owner.getAverageRating());
        assertEquals(1L, owner.getTotalReviews());

        verify(vehicleRepository, times(1)).save(vehicle);
        verify(vehicleOwnerRepository, times(1)).save(owner);
    }

    @Test
    @DisplayName("Should throw BookingNotCompletedException when booking is not completed")
    void testCreateReview_BookingNotCompleted() {
        // Arrange
        mockUser(renterUser.getUserId(), "RENTER");
        booking.setStatus(BookingStatus.ONGOING); // Not completed
        CreateReviewRequestDTO request = new CreateReviewRequestDTO(booking.getBookingId(), 5, "Too early");

        when(bookingRepository.findById(booking.getBookingId())).thenReturn(Optional.of(booking));

        // Act & Assert
        assertThrows(BookingNotCompletedException.class, () -> {
            reviewService.createReview(request);
        });

        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("Should throw UnauthorizedReviewException when reviewer is not the booking owner")
    void testCreateReview_UnauthorizedReviewer() {
        // Arrange
        mockUser(99L, "RENTER"); // Different renter ID
        CreateReviewRequestDTO request = new CreateReviewRequestDTO(booking.getBookingId(), 5, "Not my booking");

        when(bookingRepository.findById(booking.getBookingId())).thenReturn(Optional.of(booking));

        // Act & Assert
        assertThrows(UnauthorizedReviewException.class, () -> {
            reviewService.createReview(request);
        });

        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("Should throw ReviewValidationException when rating is invalid")
    void testCreateReview_InvalidRating() {
        // Arrange
        mockUser(renterUser.getUserId(), "RENTER");
        CreateReviewRequestDTO request = new CreateReviewRequestDTO(booking.getBookingId(), 6, "Excellent plus"); // Invalid rating

        when(bookingRepository.findById(booking.getBookingId())).thenReturn(Optional.of(booking));

        // Act & Assert
        assertThrows(ReviewValidationException.class, () -> {
            reviewService.createReview(request);
        });

        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("Should throw DuplicateReviewException when review already exists for booking")
    void testCreateReview_DuplicateReview() {
        // Arrange
        mockUser(renterUser.getUserId(), "RENTER");
        CreateReviewRequestDTO request = new CreateReviewRequestDTO(booking.getBookingId(), 4, "Another review");

        when(bookingRepository.findById(booking.getBookingId())).thenReturn(Optional.of(booking));
        when(reviewRepository.existsByBooking_BookingId(booking.getBookingId())).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateReviewException.class, () -> {
            reviewService.createReview(request);
        });

        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("Should delete review successfully and update aggregates as review owner")
    void testDeleteReview_SuccessAsOwner() {
        // Arrange
        mockUser(renterUser.getUserId(), "RENTER");
        Review review = new Review();
        review.setReviewId(100L);
        review.setReviewer(renterUser);
        review.setVehicle(vehicle);
        review.setVehicleOwner(owner);

        when(reviewRepository.findById(100L)).thenReturn(Optional.of(review));
        // Mock aggregates recomputation
        when(vehicleRepository.findById(vehicle.getVehicleId())).thenReturn(Optional.of(vehicle));
        when(reviewRepository.getAverageRatingByVehicle(vehicle.getVehicleId())).thenReturn(0.0);
        when(reviewRepository.countByVehicle(vehicle.getVehicleId())).thenReturn(0L);

        when(vehicleOwnerRepository.findById(owner.getVehicleOwnerId())).thenReturn(Optional.of(owner));
        when(reviewRepository.getAverageRatingByOwner(owner.getVehicleOwnerId())).thenReturn(0.0);
        when(reviewRepository.countByOwner(owner.getVehicleOwnerId())).thenReturn(0L);

        // Act
        assertDoesNotThrow(() -> reviewService.deleteReview(100L));

        // Assert
        verify(reviewRepository, times(1)).delete(review);
        verify(vehicleRepository, times(1)).save(vehicle);
        verify(vehicleOwnerRepository, times(1)).save(owner);
    }

    @Test
    @DisplayName("Should delete review successfully as Admin")
    void testDeleteReview_SuccessAsAdmin() {
        // Arrange
        mockUser(99L, "ADMIN"); // Admin user (different from review owner)
        Review review = new Review();
        review.setReviewId(100L);
        review.setReviewer(renterUser);
        review.setVehicle(vehicle);
        review.setVehicleOwner(owner);

        when(reviewRepository.findById(100L)).thenReturn(Optional.of(review));
        // Mock aggregates recomputation
        when(vehicleRepository.findById(vehicle.getVehicleId())).thenReturn(Optional.of(vehicle));
        when(vehicleOwnerRepository.findById(owner.getVehicleOwnerId())).thenReturn(Optional.of(owner));

        // Act
        assertDoesNotThrow(() -> reviewService.deleteReview(100L));

        // Assert
        verify(reviewRepository, times(1)).delete(review);
    }

    @Test
    @DisplayName("Should throw UnauthorizedReviewException when deleting other's review as non-admin")
    void testDeleteReview_Unauthorized() {
        // Arrange
        mockUser(99L, "RENTER"); // Different renter, non-admin
        Review review = new Review();
        review.setReviewId(100L);
        review.setReviewer(renterUser);

        when(reviewRepository.findById(100L)).thenReturn(Optional.of(review));

        // Act & Assert
        assertThrows(UnauthorizedReviewException.class, () -> {
            reviewService.deleteReview(100L);
        });

        verify(reviewRepository, never()).delete(any(Review.class));
    }
}
