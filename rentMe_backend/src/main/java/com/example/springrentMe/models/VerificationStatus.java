package com.example.springrentMe.models;

/**
 * Verification status for vehicle owners
 * Workflow: NOT_SUBMITTED -> PENDING -> APPROVED/REJECTED
 */
public enum VerificationStatus {
    NOT_SUBMITTED, // User registered but hasn't uploaded verification documents yet
    PENDING, // Documents submitted, awaiting admin review
    APPROVED, // Admin verified - user can now list vehicles as VEHICLE_OWNER
    REJECTED // Documents rejected - user must re-submit with corrections
}
