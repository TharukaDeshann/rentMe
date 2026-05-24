package com.example.springrentMe.controllers;

import com.example.springrentMe.DTOs.BookingRequestDTO;
import com.example.springrentMe.DTOs.BookingResponseDTO;
import com.example.springrentMe.DTOs.BookingStatusUpdateDTO;
import com.example.springrentMe.models.BookingStatus;
import com.example.springrentMe.services.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Booking endpoints.
 *
 * Renter  : POST/GET/PATCH /api/v1/bookings/**
 * Owner   : GET/PATCH      /api/v1/owner/bookings/**
 * Admin   : GET            /api/v1/admin/bookings/**
 */
@RestController
@RequestMapping("/api/v1")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // ─────────────────────────────────────────────────────────────────────────
    // RENTER ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/v1/bookings
     * Renter creates a new booking request.
     */
    @PreAuthorize("hasRole('RENTER')")
    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequestDTO request) {
        try {
            BookingResponseDTO booking = bookingService.createBooking(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    /**
     * GET /api/v1/bookings/my
     * Renter retrieves all their own bookings.
     */
    @PreAuthorize("hasRole('RENTER')")
    @GetMapping("/bookings/my")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookingsAsRenter() {
        return ResponseEntity.ok(bookingService.getMyBookingsAsRenter());
    }

    /**
     * GET /api/v1/bookings/{bookingId}
     * Get a single booking by ID.
     * Accessible by: the renter, the vehicle owner, or admin.
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<?> getBookingById(@PathVariable Long bookingId) {
        try {
            BookingResponseDTO booking = bookingService.getBookingById(bookingId);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(buildError(e.getMessage()));
        }
    }

    /**
     * PATCH /api/v1/bookings/{bookingId}/cancel
     * Renter cancels their PENDING booking request.
     */
    @PreAuthorize("hasRole('RENTER')")
    @PatchMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<?> renterCancelBooking(
            @PathVariable Long bookingId,
            @RequestBody(required = false) BookingStatusUpdateDTO request) {
        try {
            // Build a cancel DTO if the client didn't provide one
            if (request == null) {
                request = new BookingStatusUpdateDTO(BookingStatus.CANCELLED, null);
            } else {
                request.setNewStatus(BookingStatus.CANCELLED);
            }
            BookingResponseDTO booking = bookingService.renterCancelBooking(bookingId, request);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VEHICLE OWNER ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/owner/bookings
     * Owner retrieves all bookings across their vehicles.
     */
    @PreAuthorize("hasRole('VEHICLE_OWNER')")
    @GetMapping("/owner/bookings")
    public ResponseEntity<List<BookingResponseDTO>> getOwnerBookings() {
        return ResponseEntity.ok(bookingService.getMyBookingsAsOwner());
    }

    /**
     * GET /api/v1/owner/bookings/pending
     * Owner retrieves only PENDING booking requests awaiting their decision.
     */
    @PreAuthorize("hasRole('VEHICLE_OWNER')")
    @GetMapping("/owner/bookings/pending")
    public ResponseEntity<List<BookingResponseDTO>> getPendingRequests() {
        return ResponseEntity.ok(bookingService.getPendingRequestsForOwner());
    }

    /**
     * PATCH /api/v1/owner/bookings/{bookingId}/status
     * Owner approves or rejects a PENDING booking.
     *
     * Body: { "newStatus": "APPROVED" | "CANCELLED", "cancellationReason": "..." }
     */
    @PreAuthorize("hasRole('VEHICLE_OWNER')")
    @PatchMapping("/owner/bookings/{bookingId}/status")
    public ResponseEntity<?> ownerUpdateBookingStatus(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingStatusUpdateDTO request) {
        try {
            // Owner is only allowed to set APPROVED or CANCELLED
            if (request.getNewStatus() != BookingStatus.APPROVED &&
                request.getNewStatus() != BookingStatus.CANCELLED) {
                return ResponseEntity.badRequest()
                        .body(buildError("Owner can only set status to APPROVED or CANCELLED."));
            }
            BookingResponseDTO booking = bookingService.ownerUpdateBookingStatus(bookingId, request);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/admin/bookings
     * Admin retrieves all bookings in the system.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/bookings")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER
    // ─────────────────────────────────────────────────────────────────────────

    private Map<String, Object> buildError(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        return error;
    }
}