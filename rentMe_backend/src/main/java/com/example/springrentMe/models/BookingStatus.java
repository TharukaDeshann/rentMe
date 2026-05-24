package com.example.springrentMe.models;

/**
 * Lifecycle of a booking:
 *
 *  PENDING   → APPROVED  (owner approves)
 *  PENDING   → CANCELLED (owner rejects OR renter cancels before approval)
 *  APPROVED  → ONGOING   (start_date arrives  – handled by scheduled job)
 *  APPROVED  → CANCELLED (renter cancels after approval but before start_date - optional future rule)
 *  ONGOING   → COMPLETED (end_date passes     – handled by scheduled job)
 */
public enum BookingStatus {
    PENDING,    // Initial state when renter submits a booking request
    APPROVED,   // Owner has approved; waiting for start_date
    ONGOING,    // start_date has arrived; rental is in progress
    COMPLETED,  // end_date has passed; rental finished
    CANCELLED   // Rejected by owner or cancelled by renter
}